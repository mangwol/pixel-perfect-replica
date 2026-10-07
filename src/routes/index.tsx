import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { DURATIONS, PLATFORMS, type ShotListProject } from "@/lib/shot-list";
import { generateShotListFn } from "@/lib/shot-list.functions";

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
  const [error, setError] = useState<string | null>(null);

  const [light, setLight] = useState(false);
  useEffect(() => {
    setLight(localStorage.getItem("theme") === "light");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);
  function toggleTheme() {
    const next = !light;
    setLight(next);
    localStorage.setItem("theme", next ? "light" : "dark");
  }

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await generateShotListFn({ data: { videoIdea: idea, duration, platform } });
      setResult(res.project);
    } catch {
      setError("Shot list generation failed. Please try again.");
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
          <button
            onClick={toggleTheme}
            aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
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

        {error && (
          <p role="alert" className="mt-8 rounded-xl border border-destructive/50 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <section className="mt-12">
            <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-[1.5fr_1fr_auto] md:p-8">
              <div>
                <p className={label}>Project Concept</p>
                <h2 className="mt-3 text-2xl font-bold">{result.projectConcept}</h2>
                <p className="mt-2 text-muted-foreground">{result.conceptDescription}</p>
              </div>
              <div>
                <p className={label}>Visual Direction</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.visualDirection.map((v) => (
                    <span key={v} className="rounded-full border border-border bg-secondary px-3 py-1 text-sm">{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className={label}>Aspect Ratio</p>
                <p className="mt-3 font-mono text-lg font-semibold tracking-tight">{result.aspectRatio}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {result.shots.map((s) => {
                const vertical = result.aspectRatio.includes("9:16");
                return (
                <article
                  key={s.shotNumber}
                  className="group flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ring/50 md:flex-row md:gap-6 md:p-6"
                >
                  <div className={`relative shrink-0 ${vertical ? "mx-auto w-[180px] md:mx-0 md:w-[150px]" : "w-full md:w-[280px]"}`}>
                    {/* Storyboard frame: later render <img className="absolute inset-0 h-full w-full object-cover" /> inside */}
                    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/40 ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
                      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 px-4 py-4 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-6 w-6 text-muted-foreground"
                        >
                          <rect x="2" y="5" width="14" height="14" rx="2" />
                          <path d="m16 10 6-3v10l-6-3" />
                        </svg>
                        <span className={label}>Storyboard</span>
                      </div>
                    </div>
                    <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 font-mono text-[11px] font-semibold tracking-wider text-primary-foreground">
                      SHOT {String(s.shotNumber).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                      <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
                        SHOT {String(s.shotNumber).padStart(2, "0")}
                      </span>
                      <span className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground">
                        {s.startTime}–{s.endTime}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-[150px_150px_1fr]">
                      <div><dt className={label}>Shot Size</dt><dd className="mt-1.5 text-sm font-medium">{s.shotSize}</dd></div>
                      <div><dt className={label}>Camera</dt><dd className="mt-1.5 text-sm font-medium">{s.cameraMovement}</dd></div>
                      <div><dt className={label}>Description</dt><dd className="mt-1.5 text-sm text-muted-foreground">{s.description}</dd></div>
                    </dl>
                  </div>
                </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
