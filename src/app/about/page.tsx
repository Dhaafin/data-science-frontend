import type { Metadata } from "next";
import { Header, AboutView } from "@/components/organisms";

export const metadata: Metadata = {
  title: "About | Selasar Suara",
  description: "Konteks penelitian, metodologi data pipeline, dan stack teknologi pendukung platform Selasar Suara.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-(--color-bg-canvas) text-(--color-text-primary) flex flex-col relative">
      {/* Sticky top glassmorphic header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-24 pb-12 flex flex-col gap-8">
        <AboutView />
      </main>
    </div>
  );
}
