"use client";

import { useState, useEffect, useRef } from "react";
import { X, Zap, Eye, EyeOff } from "lucide-react";
import { useLang } from "@/providers/LangProvider";
import { BP } from "@/lib/utils";

const T = {
  ko: {
    title:              "로그인",
    email:              "이메일",
    password:           "비밀번호",
    loginBtn:           "로그인",
    forgotPw:           "비밀번호를 잊으셨나요?",
    emailPlaceholder:   "hello@example.com",
    passwordPlaceholder:"••••••••",
  },
  en: {
    title:              "Sign in",
    email:              "Email",
    password:           "Password",
    loginBtn:           "Sign in",
    forgotPw:           "Forgot password?",
    emailPlaceholder:   "hello@example.com",
    passwordPlaceholder:"••••••••",
  },
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: Props) {
  const { lang } = useLang();
  const t = T[lang];
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => emailRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${BP}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        onClose();
        onSuccess?.();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border/60 bg-background shadow-2xl shadow-black/30 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={15} />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--amber)] text-[oklch(0.09_0.005_60)] mb-3">
            <Zap size={18} strokeWidth={2.5} className="fill-current" />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
            Tagzo <span className="text-[var(--amber)]">AI</span>
          </span>
          <p className="text-xs text-muted-foreground mt-1">{t.title}</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-3 px-6 pb-7" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t.email}</label>
            <input
              ref={emailRef}
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 rounded-lg border border-border bg-muted/40 px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--amber)] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">{t.password}</label>
              <button type="button" className="text-[10px] text-muted-foreground hover:text-[var(--amber)] transition-colors">
                {t.forgotPw}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-muted/40 px-3 pr-9 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[var(--amber)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive text-center">
              {lang === "ko" ? "이메일 또는 비밀번호가 올바르지 않습니다." : "Invalid email or password."}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-9 rounded-lg bg-[var(--amber)] text-[oklch(0.09_0.005_60)] text-sm font-semibold hover:bg-[oklch(0.65_0.16_75)] active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "..." : t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
