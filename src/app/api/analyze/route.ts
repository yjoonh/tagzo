import Anthropic from "@anthropic-ai/sdk";
import {
  checkRateLimit,
  getClientIp,
  isAdmin,
  estimateImageTokens,
  MAX_IMAGE_TOKENS,
  MAX_IMAGE_BYTES,
} from "@/lib/rateLimit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  // ── 1. Rate limit 체크 (어드민은 제한 없음) ─────────────────────────────────
  if (!isAdmin(request)) {
    const ip = getClientIp(request);
    const fingerprint = request.headers.get("X-Client-Fingerprint");
    const rl = checkRateLimit(ip, fingerprint);
    if (!rl.allowed) {
      return Response.json({ error: "LOGIN_REQUIRED" }, { status: 429 });
    }
  }

  // ── 2. 이미지 파싱 ────────────────────────────────────────────────────────
  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return Response.json({ error: "이미지가 없습니다." }, { status: 400 });
  }

  // ── 3. 파일 크기 제한 ─────────────────────────────────────────────────────
  if (imageFile.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: `LOGIN_REQUIRED` },
      { status: 413 }
    );
  }

  // ── 4. 예상 토큰 제한 ────────────────────────────────────────────────────
  const estimatedTokens = estimateImageTokens(imageFile.size);
  if (estimatedTokens > MAX_IMAGE_TOKENS) {
    return Response.json(
      { error: `LOGIN_REQUIRED` },
      { status: 413 }
    );
  }

  // ── 5. Claude API 호출 ────────────────────────────────────────────────────
  const bytes = await imageFile.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mediaType = imageFile.type as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `You are an expert frontend developer.

STEP 1 — Validate the image.
If the image does NOT contain a UI/interface design (e.g. it is a real-life photo, portrait, illustration, artwork, nature scene, or any non-interface content), respond ONLY with this JSON and nothing else:
{"error":"NOT_UI"}

STEP 2 — If it IS a UI/interface screenshot or mockup, recreate it as pixel-perfect, production-ready code.

Generate THREE versions:
1. html: A complete self-contained HTML fragment with an embedded <style> tag. No external dependencies. Recreate all visual details precisely — colors, spacing, typography, shadows. Use CSS for hover/focus states.
2. react: A complete React TypeScript functional component. Use Tailwind CSS utility classes. Include all imports. Export as default.
3. vue: A complete Vue 3 SFC using <script setup lang="ts"> and Tailwind CSS utility classes.

CRITICAL RULE for html output: NEVER place raw text directly inside <div>, <section>, <header>, <footer>, <article>, <nav>, <main>, or any block-level element. ALL visible text — labels, headings, descriptions, prices, dates, button text, placeholder text — MUST be wrapped in a <span> element. Every <span> carrying text must have explicit inline styles for font-size and color (e.g. style="font-size:14px;color:#333"). This is required so that text properties can be individually edited.

Respond ONLY with valid JSON — no markdown fences, no explanation outside the JSON:
{"html":"...","react":"...","vue":"..."}`,
          },
        ],
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    return Response.json({ error: "예상치 못한 응답 형식입니다." }, { status: 500 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(block.text);
  } catch {
    const match = block.text.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "AI 응답 파싱에 실패했습니다." }, { status: 500 });
    }
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return Response.json({ error: "AI 응답 파싱에 실패했습니다." }, { status: 500 });
    }
  }

  // UI가 아닌 이미지 판별
  if (
    parsed !== null &&
    typeof parsed === "object" &&
    (parsed as Record<string, unknown>).error === "NOT_UI"
  ) {
    return Response.json({ error: "NOT_UI" }, { status: 422 });
  }

  return Response.json(parsed);
}
