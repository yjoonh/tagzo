import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { FaqSection } from "@/components/FaqSection";
import { HomeContent, HowItWorks, PageFooter } from "@/components/HomeContent";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col flex-1">
        {/* ── Hero + Upload ── */}
        <section className="relative flex flex-col items-center justify-center px-4 py-20 sm:py-28 overflow-hidden">
          {/* Background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.72 0.16 75 / 0.08) 0%, transparent 70%)",
            }}
          />
          {/* Subtle grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <HomeContent />
          <UploadZone />
        </section>

        {/* ── How it works ── */}
        <HowItWorks />

        {/* ── FAQ ── */}
        <FaqSection />
      </main>

      <PageFooter />
    </div>
  );
}
