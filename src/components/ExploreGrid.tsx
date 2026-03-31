"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Code2, Clock } from "lucide-react";
import { BP } from "@/lib/utils";

interface GalleryItem {
  id: string;
  createdAt: string;
  snapshot: string;
  html: string;
  react: string;
  vue: string;
}

export function ExploreGrid() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${BP}/api/gallery`)
      .then((r) => r.json())
      .then((d: { items?: GalleryItem[] }) => {
        setItems(d.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOpen = (item: GalleryItem) => {
    sessionStorage.setItem(
      "tagzo_result",
      JSON.stringify({ html: item.html, react: item.react, vue: item.vue })
    );
    router.push("/result");
  };

  return (
    <section id="explore" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* ── Header ── */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs font-mono text-[var(--amber)] tracking-widest uppercase mb-2">
            Explore
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            변환된 컴포넌트
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            업로드한 UI 이미지가 변환되면 여기에 자동 저장됩니다.
          </p>
        </div>
        {items.length > 0 && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
            {items.length}개
          </span>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {[180, 240, 160, 280, 200, 220, 160, 300].map((h, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-3 rounded-lg bg-muted animate-pulse"
              style={{ height: h }}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
            <Code2 size={24} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            아직 변환된 컴포넌트가 없습니다.
            <br />
            위에서 이미지를 업로드해 첫 컴포넌트를 만들어 보세요.
          </p>
        </div>
      )}

      {/* ── Masonry Grid ── */}
      {!loading && items.length > 0 && (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpen(item)}
              className="break-inside-avoid mb-3 group relative overflow-hidden rounded-lg border border-border/60 bg-card hover:border-[var(--amber)]/40 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--amber)]/5 cursor-pointer"
            >
              <div className="overflow-hidden min-h-[160px] bg-white flex items-start justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.snapshot}
                  alt="component preview"
                  className="w-full h-auto block"
                />
              </div>
              <div className="absolute inset-0 bg-background/85 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4">
                <span className="text-xs font-semibold text-foreground">클릭하여 편집</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
