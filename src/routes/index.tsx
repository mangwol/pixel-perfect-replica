import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DURATIONS,
  PLATFORMS,
  generateShotList,
  type ShotListProject,
} from "@/lib/shot-list";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Creative Studio — Turn your idea into a shot list" },
      { name: "description", content: "Describe your video idea and create a simple production-ready shot plan." },
      { property: "og:title", content: "AI Creative Studio" },
      { property: "og:description", content: "Describe your video idea and create a simple production-ready shot plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const label = "font-mono text-xs uppercase tracking-widest text-muted-foreground";
const field =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Index() {
  const [idea, setIdea] = useState("");
  const [duration, setDuration] = useState("15 sec");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShotListProject | null>(null);

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    try {
      setResult(await generateShotList({ idea, duration, platform }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-sm font-semibold tracking-tight">AI Creative Studio</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Turn your idea into a shot list.</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Describe your video idea and create a simple production-ready shot plan.
        </p>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
          <label className="block">
            <span className={label}>Video Idea</span>
            <textarea
              rows={5}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="20대 여성을 대상으로 한 몽환적인 향수 브랜드 광고"
              className={`${field} mt-3 resize-none`}
            />
          </label>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className={label}>Duration</span>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className={`${field} mt-3`}>
                {DURATIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={label}>Platform</span>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={`${field} mt-3`}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 md:w-auto"
          >
            {loading ? "Generating…" : "Generate Shot List"}
          </button>
        </section>

        {loading && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            Building your shot plan…
          </div>
        )}

        {result && (
          <section className="mt-12">
            <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2 md:p-8">
              <div>
                <p className={label}>Project Concept</p>
                <h2 className="mt-3 text-2xl font-bold">{result.title}</h2>
                <p className="mt-2 text-muted-foreground">{result.concept}</p>
              </div>
              <div>
                <p className={label}>Visual Direction</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.visualDirection.map((v) => (
                    <span key={v} className="rounded-full border border-border bg-secondary px-3 py-1 text-sm">{v}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {result.shots.map((s) => (
                <article key={s.number} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-primary">
                      SHOT {String(s.number).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{s.time}</span>
                  </div>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-[160px_160px_1fr]">
                    <div><dt className={label}>Shot Size</dt><dd className="mt-1 text-sm">{s.shotSize}</dd></div>
                    <div><dt className={label}>Camera</dt><dd className="mt-1 text-sm">{s.camera}</dd></div>
                    <div><dt className={label}>Description</dt><dd className="mt-1 text-sm text-muted-foreground">{s.description}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
