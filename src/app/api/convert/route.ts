import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const { html } = (await request.json()) as { html: string };

  if (!html) {
    return Response.json({ error: "HTML이 없습니다." }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Convert the following HTML/CSS component into React TypeScript and Vue 3 equivalents. Preserve all styles exactly (colors, spacing, typography, etc.), including any inline styles.

HTML:
${html}

Generate:
1. react: Complete React TypeScript functional component. Use inline style props (style={{}}) for all CSS. Export as default.
2. vue: Complete Vue 3 SFC with <script setup lang="ts">. Use :style binding for all CSS.

Respond ONLY with valid JSON — no markdown fences:
{"react":"...","vue":"..."}`,
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
    if (!match) return Response.json({ error: "파싱 실패" }, { status: 500 });
    try { parsed = JSON.parse(match[0]); }
    catch { return Response.json({ error: "파싱 실패" }, { status: 500 }); }
  }

  return Response.json(parsed);
}
