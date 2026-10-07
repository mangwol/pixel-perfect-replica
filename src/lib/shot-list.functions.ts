import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DURATIONS,
  PLATFORMS,
  getAspectRatio,
  getSampleShotList,
  getShotCount,
  type ShotListProject,
} from "./shot-list";

// AI connection is configured via environment variables (never hardcoded):
//   LOVABLE_API_KEY   – required for real AI generation; if missing, sample data is returned.
//   SHOT_LIST_MODEL   – optional model override.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const DEFAULT_MODEL = "openai/gpt-6-astra";

const InputSchema = z.object({
  videoIdea: z.string().max(2000),
  duration: z.enum(DURATIONS as [string, ...string[]]),
  platform: z.enum(PLATFORMS as [string, ...string[]]),
});

export const ShotSchema = z.object({
  shotNumber: z.number().int().positive(),
  startTime: z.string(),
  endTime: z.string(),
  shotSize: z.string(),
  cameraMovement: z.string(),
  description: z.string(),
  imagePrompt: z.string(),
  videoPrompt: z.string(),
});

export const ProjectSchema = z.object({
  projectConcept: z.string(),
  conceptDescription: z.string(),
  visualDirection: z.array(z.string()),
  aspectRatio: z.string(),
  shots: z.array(ShotSchema).min(1),
});

const str = { type: "string" };
const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["projectConcept", "conceptDescription", "visualDirection", "aspectRatio", "shots"],
  properties: {
    projectConcept: str,
    conceptDescription: str,
    visualDirection: { type: "array", items: str },
    aspectRatio: str,
    shots: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["shotNumber", "startTime", "endTime", "shotSize", "cameraMovement", "description", "imagePrompt", "videoPrompt"],
        properties: {
          shotNumber: { type: "integer" },
          startTime: str,
          endTime: str,
          shotSize: str,
          cameraMovement: str,
          description: str,
          imagePrompt: str,
          videoPrompt: str,
        },
      },
    },
  },
};

export type GenerateResult = { project: ShotListProject; source: "ai" | "sample" };

export const generateShotListFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<GenerateResult> => {
    const req = { idea: data.videoIdea, duration: data.duration, platform: data.platform };
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      // Fallback: no key configured yet.
      await new Promise((r) => setTimeout(r, 800));
      return { project: getSampleShotList(req), source: "sample" };
    }

    const aspectRatio = getAspectRatio(data.platform);
    const count = getShotCount(data.duration);
    const instructions = `You are a professional video director. Create a shot list for a short video.
Return ONLY JSON matching the schema.
Rules:
- aspectRatio must be exactly "${aspectRatio}".
- Exactly ${count} shots, shotNumber 1..${count}, covering 0:00 to the total duration (${data.duration}) with times in m:ss format.
- description: Korean, one concise sentence.
- imagePrompt and videoPrompt: English, detailed, for AI image/video generation.
- visualDirection: 2-4 short English keywords.`;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: process.env.SHOT_LIST_MODEL || DEFAULT_MODEL,
        instructions,
        input: [
          {
            role: "user",
            content: `Video idea: ${data.videoIdea || "(none provided)"}\nDuration: ${data.duration}\nPlatform: ${data.platform}`,
          },
        ],
        reasoning: { effort: "low" },
        store: false,
        stream: true,
        text: { format: { type: "json_schema", name: "shot_list", strict: true, schema: JSON_SCHEMA } },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, body.slice(0, 500));
      throw new Error("Shot list generation failed. Please try again.");
    }

    // Accumulate streamed output text from SSE.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "response.output_text.delta") text += evt.delta ?? "";
            if (evt.type === "error" || evt.type === "response.failed") {
              console.error("AI stream error", payload.slice(0, 500));
              throw new Error("Shot list generation failed. Please try again.");
            }
          } catch (e) {
            if (e instanceof Error && e.message.startsWith("Shot list")) throw e;
          }
        }
      }
    }

    // Validate JSON structure.
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("AI returned invalid JSON", text.slice(0, 500));
      throw new Error("Shot list generation failed. Please try again.");
    }
    const result = ProjectSchema.safeParse(parsed);
    if (!result.success) {
      console.error("AI JSON failed validation", result.error.message);
      throw new Error("Shot list generation failed. Please try again.");
    }
    // Keep aspect ratio consistent with the selected platform.
    return { project: { ...result.data, aspectRatio }, source: "ai" };
  });
