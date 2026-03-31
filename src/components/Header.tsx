"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/providers/LangProvider";
import { LoginModal } from "@/components/LoginModal";
import { BP } from "@/lib/utils";

const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [loginOpen, setLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`${BP}/api/me`)
      .then((r) => r.json())
      .then((d: { admin: boolean }) => setIsAdmin(d.admin))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch(`${BP}/api/logout`, { method: "POST" });
    setIsAdmin(false);
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* ── Left: Logo + Nav ── */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--amber)] text-[oklch(0.09_0.005_60)]">
                <Zap size={14} strokeWidth={2.5} className="fill-current" />
              </span>
              <span
                className="text-base font-bold tracking-tight"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                Tagzo
                <span className="text-[var(--amber)]"> AI</span>
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/explore"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {lang === "ko" ? "둘러보기" : "Explore"}
              </Link>
            </nav>
          </div>

          {/* ── Right: Controls ── */}
          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer">
                {lang === "ko" ? "한국어" : "English"}
                <ChevronDown size={12} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                {LANGS.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    className={`text-xs cursor-pointer ${lang === l.code ? "text-[var(--amber)]" : ""}`}
                    onClick={() => setLang(l.code as "ko" | "en")}
                  >
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="테마 변경"
            >
              <Sun size={15} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon size={15} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Login / Logout */}
            {isAdmin ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-4 text-xs text-muted-foreground hover:text-foreground font-medium"
                onClick={handleLogout}
              >
                {lang === "ko" ? "로그아웃" : "Sign out"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 px-4 text-xs bg-[var(--amber)] text-[oklch(0.09_0.005_60)] hover:bg-[oklch(0.65_0.16_75)] font-medium"
                onClick={() => setLoginOpen(true)}
              >
                {lang === "ko" ? "로그인" : "Sign in"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>

    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => setIsAdmin(true)} />
    </>
  );
}
