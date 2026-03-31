/**
 * 1회 무료 사용 제한
 * - IP와 브라우저 핑거프린트를 각각 독립 추적
 * - 둘 중 하나라도 이미 사용된 기록이 있으면 차단
 * - IP 변경 + 시크릿 모드 조합도 핑거프린트로 차단
 */

const usedIps = new Set<string>();
const usedFingerprints = new Set<string>();

// 메모리 누수 방지: 7일마다 초기화 (서버 재시작 없이 장기 운영 시)
setInterval(() => {
  usedIps.clear();
  usedFingerprints.clear();
}, 7 * 24 * 60 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
}

export function checkRateLimit(ip: string, fingerprint: string | null): RateLimitResult {
  // 이미 사용한 IP이거나 핑거프린트이면 차단
  if (usedIps.has(ip)) return { allowed: false };
  if (fingerprint && usedFingerprints.has(fingerprint)) return { allowed: false };

  // 첫 사용 — 기록
  usedIps.add(ip);
  if (fingerprint) usedFingerprints.add(fingerprint);

  return { allowed: true };
}

export function isAdmin(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const secret = process.env.ADMIN_SECRET ?? "";
  if (!secret) return false;
  return cookie.split(";").some((c) => c.trim() === `tagzo_admin=${secret}`);
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * 이미지 토큰 추정
 * Claude Vision: 512px 타일 기준, PNG 압축률 4:1 가정
 */
export function estimateImageTokens(fileSizeBytes: number): number {
  const estimatedPixels = fileSizeBytes * 4;
  const MAX_DIM = 1568;
  const TILE_SIZE = 512;
  const pixels = Math.min(estimatedPixels, MAX_DIM * MAX_DIM);
  const side = Math.sqrt(pixels);
  const tilesW = Math.ceil(Math.min(side, MAX_DIM) / TILE_SIZE);
  const tilesH = Math.ceil(Math.min(side, MAX_DIM) / TILE_SIZE);
  return 85 + tilesW * tilesH * 170;
}

export const MAX_IMAGE_TOKENS = 1_500;
export const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1MB
