// Shot list domain types + generator.
//
// The shape below is the contract for the future AI API response:
// `generateShotList` receives the user request and returns a ShotListProject.
// To plug in a real API later, replace the body of `generateShotList` with a
// call that returns JSON matching ShotListProject and render it as-is.

export type Shot = {
  shotNumber: number;
  startTime: string;
  endTime: string;
  shotSize: string;
  cameraMovement: string;
  description: string;
  // Not rendered in the UI yet; kept in data for the future AI image/video step.
  imagePrompt: string;
  videoPrompt: string;
};

export type ShotListProject = {
  projectConcept: string;
  conceptDescription: string;
  visualDirection: string[];
  aspectRatio: string;
  shots: Shot[];
};

export type ShotListRequest = {
  idea: string;
  duration: string;
  platform: string;
};

export const DURATIONS = ["10 sec", "15 sec", "30 sec", "60 sec"];
export const PLATFORMS = ["Instagram Reels", "TikTok", "YouTube Shorts", "YouTube", "Other"];

const SHOTS_BY_DURATION: Record<string, number> = {
  "10 sec": 4,
  "15 sec": 5,
  "30 sec": 7,
  "60 sec": 10,
};

const VERTICAL_PLATFORMS = new Set(["Instagram Reels", "TikTok", "YouTube Shorts"]);

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Predefined sample pool for the "Peach Summer" concept. Replace with real AI output later.
const SHOT_POOL: Omit<Shot, "shotNumber" | "startTime" | "endTime">[] = [
  {
    shotSize: "Extreme Close Up",
    cameraMovement: "Static",
    description: "복숭아 표면에 맺힌 물방울을 극단적인 클로즈업으로 보여준다.",
    imagePrompt: "Extreme close-up of glistening water droplets on a ripe peach skin, soft summer daylight, pastel tones, shallow depth of field, photorealistic",
    videoPrompt: "Static macro shot, water droplets slowly glisten on peach skin, warm sunlight flickers gently, dreamy summer mood",
  },
  {
    shotSize: "Close Up",
    cameraMovement: "Slow Push-in",
    description: "부드러운 햇빛 속에서 향수병이 천천히 화면에 등장한다.",
    imagePrompt: "Close-up of an elegant perfume bottle emerging from soft sunlight on a windowsill, peach-toned pastel palette, shallow depth of field",
    videoPrompt: "Slow push-in on a perfume bottle, sunlight rays drift across the glass, dust particles float in the air, soft dreamy atmosphere",
  },
  {
    shotSize: "Medium Shot",
    cameraMovement: "Slow Pan Right",
    description: "모델이 창가에서 향수병을 들어 올린다.",
    imagePrompt: "Medium shot of a young woman by a bright window lifting a perfume bottle, soft summer light, pastel peach tones, film-like grain",
    videoPrompt: "Slow pan right, model gracefully raises the perfume bottle toward the window light, gentle fabric movement, warm afternoon glow",
  },
  {
    shotSize: "Close Up",
    cameraMovement: "Handheld",
    description: "모델이 손목에 향수를 뿌리는 순간을 자연스럽게 보여준다.",
    imagePrompt: "Close-up of a woman's wrist being sprayed with perfume, fine mist backlit by sunlight, intimate and natural, pastel summer tones",
    videoPrompt: "Handheld close-up, perfume mist sprays onto the wrist and shimmers in the light, subtle natural camera sway, intimate moment",
  },
  {
    shotSize: "Insert",
    cameraMovement: "Whip Pan",
    description: "복숭아 과육이 부드럽게 갈라지는 컷을 빠르게 보여준다.",
    imagePrompt: "Insert shot of a juicy peach splitting open, soft flesh and juice in vivid detail, pastel color grade, macro photography",
    videoPrompt: "Fast whip pan into a peach splitting open in slow motion, juice droplets burst, vibrant yet pastel color grade",
  },
  {
    shotSize: "Wide Shot",
    cameraMovement: "Slow Dolly Out",
    description: "창가에 선 모델의 전신과 여름의 공간감을 담아낸다.",
    imagePrompt: "Wide shot of a model standing full-body at a large sunlit window, airy summer interior, pastel peach palette, cinematic composition",
    videoPrompt: "Slow dolly out revealing the model full-body by the window, curtains sway lightly, spacious dreamy summer room",
  },
  {
    shotSize: "Medium Close Up",
    cameraMovement: "Rack Focus",
    description: "배경의 햇살이 흐려지며 모델의 표정에 초점이 맞는다.",
    imagePrompt: "Medium close-up of a model's serene expression, blurred sunlit background, bokeh highlights, pastel tones, shallow depth of field",
    videoPrompt: "Rack focus from glowing bokeh background to the model's face, her expression softens into a gentle smile, warm light wraps around",
  },
  {
    shotSize: "Detail Shot",
    cameraMovement: "Slow Motion",
    description: "머리카락을 스치는 바람과 광채를 슬로 모션으로 담아낸다.",
    imagePrompt: "Detail shot of hair strands catching sunlight and breeze, glowing highlights, pastel summer grade, dreamy slow-motion feel",
    videoPrompt: "Slow motion, wind sweeps through the model's hair, sunlight glints off each strand, ethereal dreamy shimmer",
  },
  {
    shotSize: "Medium Shot",
    cameraMovement: "Slow Pan Left",
    description: "모델이 여유롭게 웃으며 여름 오후의 분위기를 완성한다.",
    imagePrompt: "Medium shot of a model laughing naturally in a sunlit room, relaxed summer afternoon mood, pastel peach color palette",
    videoPrompt: "Slow pan left, the model laughs effortlessly, afternoon light flickers through the window, carefree summer vibe",
  },
  {
    shotSize: "Product Shot",
    cameraMovement: "Slow Push-in",
    description: "제품을 화면 중앙에 배치하고 브랜드 카피와 함께 영상이 끝난다.",
    imagePrompt: "Centered product shot of the perfume bottle on a peach-toned pedestal, soft studio light, minimal pastel background, premium feel",
    videoPrompt: "Slow push-in on the centered perfume bottle, light sweeps across the label, brand copy fades in, elegant closing shot",
  },
];

function buildShots(duration: string): Shot[] {
  const count = SHOTS_BY_DURATION[duration] ?? 5;
  const seconds = parseInt(duration, 10) || 15;
  const step = seconds / count;
  return SHOT_POOL.slice(0, count).map((s, i) => ({
    shotNumber: i + 1,
    startTime: formatTime(Math.round(i * step)),
    endTime: formatTime(Math.round((i + 1) * step)),
    ...s,
  }));
}

export async function generateShotList(req: ShotListRequest): Promise<ShotListProject> {
  await new Promise((r) => setTimeout(r, 1200));
  // Sample response shaped exactly like the future AI API JSON.
  return {
    projectConcept: "Peach Summer",
    conceptDescription: "A dreamy perfume commercial capturing the feeling of a warm summer afternoon.",
    visualDirection: ["Soft daylight", "Pastel tone", "Shallow depth of field"],
    aspectRatio: VERTICAL_PLATFORMS.has(req.platform) ? "Vertical 9:16" : "Horizontal 16:9",
    shots: buildShots(req.duration),
  };
}
