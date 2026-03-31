"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ImageIcon, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/providers/LangProvider";
import { LoginModal } from "@/components/LoginModal";
import { BP } from "@/lib/utils";

const UI = {
  ko: {
    ariaLabel: "이미지 업로드 영역",
    dragText: "이미지를 드래그하거나",
    clickText: "클릭하여 선택",
    hint: (mb: number) => `PNG, JPG, WebP · 최대 ${mb}MB`,
    remove: "제거",
    converting: "AI가 컴포넌트를 분석하고 코드를 작성 중입니다...",
    convert: "변환하기",
    errImage: "이미지 파일만 업로드할 수 있습니다.",
    errSize: (mb: number) => `파일 크기는 ${mb}MB 이하여야 합니다.`,
    errFail: "변환 실패",
    errUnknown: "알 수 없는 오류가 발생했습니다.",
    errNotUi: "UI 이미지가 아닙니다. 앱·웹 화면 캡처 또는 디자인 시안을 올려주세요.",
  },
  en: {
    ariaLabel: "Image upload area",
    dragText: "Drag an image or",
    clickText: "click to select",
    hint: (mb: number) => `PNG, JPG, WebP · Max ${mb}MB`,
    remove: "Remove",
    converting: "AI is analyzing and writing component code...",
    convert: "Convert",
    errImage: "Only image files are allowed.",
    errSize: (mb: number) => `File size must be ${mb}MB or less.`,
    errFail: "Conversion failed",
    errUnknown: "An unknown error occurred.",
    errNotUi: "This doesn't look like a UI image. Please upload an app/web screenshot or design mockup.",
  },
} as const;

const MAX_SIZE_MB = 1;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadedFile {
  file: File;
  preview: string;
}

export function UploadZone() {
  const router = useRouter();
  const { lang } = useLang();
  const u = UI[lang];
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(u.errImage);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(u.errSize(MAX_SIZE_MB));
      return;
    }
    const preview = URL.createObjectURL(file);
    setUploaded({ file, preview });
  }, [u]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    if (uploaded) URL.revokeObjectURL(uploaded.preview);
    setUploaded(null);
    setError(null);
  };

  const getFingerprint = (): string => {
    const raw = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency ?? 0,
      navigator.platform ?? "",
    ].join("|");
    // 간단한 해시
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = Math.imul(31, h) + raw.charCodeAt(i) | 0;
    }
    return (h >>> 0).toString(36);
  };

  const handleConvert = async () => {
    if (!uploaded) return;
    setConverting(true);
    setError(null);
    setNeedsLogin(false);

    try {
      const form = new FormData();
      form.append("image", uploaded.file);

      const res = await fetch(`${BP}/api/analyze`, {
        method: "POST",
        body: form,
        headers: { "X-Client-Fingerprint": getFingerprint() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? u.errFail);
      }

      const data = await res.json();
      sessionStorage.setItem("tagzo_result", JSON.stringify(data));
      router.push("/result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : u.errUnknown;
      if (msg === "LOGIN_REQUIRED") {
        setNeedsLogin(true);
      } else if (msg === "NOT_UI") {
        setError(u.errNotUi);
      } else {
        setError(msg);
      }
      setConverting(false);
    }
  };

  return (
    <>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleConvert} />
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* ── Drop Zone ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={u.ariaLabel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploaded && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploaded && inputRef.current?.click()}
        className={[
          "relative w-full rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]",
          uploaded
            ? "border-[var(--amber)]/40 bg-card cursor-default"
            : dragging
              ? "border-[var(--amber)] bg-[var(--amber)]/5 cursor-copy scale-[1.01]"
              : "border-border hover:border-[var(--amber)]/50 hover:bg-muted/40 cursor-pointer",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleInputChange}
        />

        {uploaded ? (
          /* ── Preview ── */
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            <div className="relative flex-shrink-0 w-full sm:w-48 h-36 rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploaded.preview}
                alt="업로드된 이미지"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-between py-1 gap-2 min-w-0">
              <div>
                <p className="text-sm font-medium truncate">{uploaded.file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(uploaded.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <ImageIcon size={11} />
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors w-fit"
              >
                <X size={12} /> {u.remove}
              </button>
            </div>
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 text-center select-none">
            <div className={[
              "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-200",
              dragging
                ? "border-[var(--amber)] bg-[var(--amber)]/10 text-[var(--amber)] scale-110"
                : "border-border text-muted-foreground"
            ].join(" ")}>
              <Upload size={22} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {u.dragText}{" "}
                <span className="text-[var(--amber)] underline underline-offset-2">{u.clickText}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {u.hint(MAX_SIZE_MB)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Login required ── */}
      {needsLogin && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber)]/5 px-4 py-3 animate-float-up">
          <p className="text-xs text-foreground leading-relaxed">
            {lang === "ko"
              ? "계속 사용하려면 로그인이 필요합니다."
              : "Please sign in to continue using this feature."}
          </p>
          <button
            onClick={() => setLoginOpen(true)}
            className="flex-shrink-0 text-xs font-semibold text-[var(--amber)] hover:underline underline-offset-2"
          >
            {lang === "ko" ? "로그인" : "Sign in"}
          </button>
        </div>
      )}

      {/* ── Error Message ── */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive animate-float-up">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* ── Convert Button ── */}
      {uploaded && !error && (
        <Button
          onClick={handleConvert}
          disabled={converting}
          className="w-full h-11 gap-2 bg-[var(--amber)] text-[oklch(0.09_0.005_60)] hover:bg-[oklch(0.65_0.16_75)] font-semibold text-sm transition-all active:scale-95 animate-float-up"
        >
          {converting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {u.converting}
            </>
          ) : (
            <>
              {u.convert}
              <ArrowRight size={15} />
            </>
          )}
        </Button>
      )}
    </div>
    </>
  );
}
