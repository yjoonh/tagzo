"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useLang } from "@/providers/LangProvider";
import type { GalleryItem } from "@/app/api/gallery/route";
import { Code2, ExternalLink } from "lucide-react";
import { BP } from "@/lib/utils";

const T = {
  ko: {
    label:    "Explore",
    title:    "저장된 컴포넌트",
    desc:     "저장한 UI 컴포넌트를 확인하세요.",
    empty:    "아직 저장된 컴포넌트가 없습니다.",
    emptySub: "변환 결과 화면에서 [저장하기]를 눌러 컴포넌트를 보관하세요.",
    openTab:  "새 창으로 열기",
    count:    (n: number) => `${n}개`,
  },
  en: {
    label:    "Explore",
    title:    "Saved Components",
    desc:     "Browse your saved UI components.",
    empty:    "No saved components yet.",
    emptySub: "Click [Save] on the result page to save a component here.",
    openTab:  "Open in new tab",
    count:    (n: number) => `${n} items`,
  },
} as const;

export default function ExplorePage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang];
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  void router;

  useEffect(() => {
    fetch(`${BP}/api/gallery`)
      .then((r) => r.json())
      .then((d: { items?: GalleryItem[] }) => {
        setItems(d.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOpenNewTab = (item: GalleryItem) => {
    sessionStorage.setItem(
      "tagzo_result",
      JSON.stringify({ html: item.html, react: item.react, vue: item.vue })
    );
    window.open(`${BP}/result`, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-[var(--amber)] tracking-widest uppercase mb-2">
              {t.label}
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">{t.desc}</p>
          </div>
          {items.length > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
              {t.count(items.length)}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="columns-1 sm:columns-2 gap-6">
            {[240, 180, 300, 200, 260].map((h, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-6 rounded-xl border border-border/60 bg-muted/40 animate-pulse"
                style={{ height: h }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
              <Code2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium">{t.empty}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.emptySub}</p>
            </div>
          </div>
        )}

        {/* Masonry grid */}
        {!loading && items.length > 0 && (
          <div className="columns-1 sm:columns-2 gap-6">
            {items.map((item) => (
              <ComponentCard
                key={item.id}
                item={item}
                openTabLabel={t.openTab}
                onOpenTab={() => handleOpenNewTab(item)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 py-6 px-4 text-center text-xs text-muted-foreground">
        © 2026 Tagzo AI · All rights reserved
      </footer>
    </div>
  );
}

// ── ComponentCard ────────────────────────────────────────────────────────────

function ComponentCard({
  item,
  openTabLabel,
  onOpenTab,
}: {
  item: GalleryItem;
  openTabLabel: string;
  onOpenTab: () => void;
}) {
  const iframeDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;}body{margin:0;padding:16px;}</style>
</head>
<body>${item.html}</body>
</html>`;

  return (
    <div className="break-inside-avoid mb-6 group rounded-xl border border-border/60 bg-card overflow-hidden hover:border-[var(--amber)]/40 hover:shadow-lg hover:shadow-[var(--amber)]/5 transition-all duration-200">
      {/* iframe — height auto via scrollHeight after load */}
      <IframeAutoHeight srcDoc={iframeDoc} title={item.title} />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40">
        <span className="text-[11px] text-muted-foreground">
          {item.createdAt.slice(0, 10)}
        </span>
        <button
          onClick={onOpenTab}
          title={openTabLabel}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-[var(--amber)] hover:bg-[var(--amber)]/10 transition-colors"
        >
          <ExternalLink size={13} />
        </button>
      </div>
    </div>
  );
}

// ── IframeAutoHeight ─────────────────────────────────────────────────────────

function IframeAutoHeight({ srcDoc, title }: { srcDoc: string; title: string }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ paddingBottom: "50%" }}>
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        style={{ position: "absolute", top: 0, left: 0, width: "600px", height: "100%", border: "none", display: "block" }}
        className="pointer-events-none group-hover:pointer-events-auto"
        title={title}
      />
    </div>
  );
}
