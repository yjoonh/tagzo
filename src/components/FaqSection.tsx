"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLang, T } from "@/providers/LangProvider";

export function FaqSection() {
  const { lang } = useLang();
  const t = T[lang];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-12">
        <p className="text-xs font-mono text-[var(--amber)] tracking-widest uppercase mb-3">
          {t.faqLabel}
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {t.faqTitle}
        </h2>
      </div>

      <div className="divide-y divide-border/60">
        {t.faqs.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            >
              <span className="text-sm font-medium group-hover:text-[var(--amber)] transition-colors">
                {item.q}
              </span>
              <ChevronDown
                size={16}
                className={[
                  "flex-shrink-0 text-muted-foreground transition-transform duration-200",
                  open === i ? "rotate-180 text-[var(--amber)]" : "",
                ].join(" ")}
              />
            </button>
            {open === i && (
              <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
