"use client";

import { useLang, T } from "@/providers/LangProvider";

export function HomeContent() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <>
      {/* ── Hero text ── */}
      <div className="mb-6 flex items-center gap-2 rounded-full border border-[var(--amber)]/30 bg-[var(--amber)]/5 px-4 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
        <span className="text-xs font-mono text-[var(--amber)] tracking-wide">{t.badge}</span>
      </div>

      <h1
        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center leading-[1.1] tracking-tight max-w-3xl mb-4"
        style={{ fontFamily: "var(--font-syne)" }}
      >
        Tagzo <span className="text-[var(--amber)]">AI</span>
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
        {t.heroSub1}
        <br />
        {t.heroSub2}
      </p>
    </>
  );
}

export function HowItWorks() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <p className="text-xs font-mono text-[var(--amber)] tracking-widest uppercase mb-3">
          {t.howLabel}
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {t.howTitle}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t.howDesc1}<br />{t.howDesc2}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        {t.steps.map(({ step, title, desc, img }) => (
          <div key={step} className="flex flex-col gap-4">
            <div className="relative rounded-xl border border-border/60 overflow-hidden aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`step ${step}`} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 text-[10px] font-mono font-semibold text-[var(--amber)] bg-black/60 backdrop-blur-sm border border-[var(--amber)]/30 rounded-full px-2 py-0.5">
                STEP {step}
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PageFooter() {
  const { lang } = useLang();
  return (
    <footer className="border-t border-border/40 py-6 px-4 text-center text-xs text-muted-foreground">
      {T[lang].footer}
    </footer>
  );
}
