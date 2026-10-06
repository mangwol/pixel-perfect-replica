// Shot list domain types + generator. Swap `generateShotList` for a real AI call later.

export type Shot = {
  number: number;
  time: string;
  shotSize: string;
  camera: string;
  description: string;
};

export type ShotListProject = {
  title: string;
  concept: string;
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
const SHOT_POOL: Omit<Shot, "number" | "time">[] = [
  { shotSize: "Extreme Close Up", camera: "Static", description: "복숭아 표면에 맺힌 물방울을 극단적인 클로즈업으로 보여준다." },
  { shotSize: "Close Up", camera: "Slow Push-in", description: "부드러운 햇빛 속에서 향수병이 천천히 화면에 등장한다." },
  { shotSize: "Medium Shot", camera: "Slow Pan Right", description: "모델이 창가에서 향수병을 들어 올린다." },
  { shotSize: "Close Up", camera: "Handheld", description: "모델이 손목에 향수를 뿌리는 순간을 자연스럽게 보여준다." },
  { shotSize: "Insert", camera: "Whip Pan", description: "복숭아 과육이 부드럽게 갈라지는 컷을 빠르게 보여준다." },
  { shotSize: "Wide Shot", camera: "Slow Dolly Out", description: "창가에 선 모델의 전신과 여름의 공간감을 담아낸다." },
  { shotSize: "Medium Close Up", camera: "Rack Focus", description: "배경의 햇살이 흐려지며 모델의 표정에 초점이 맞는다." },
  { shotSize: "Detail Shot", camera: "Slow Motion", description: "머리카락을 스치는 바람과 광채를 슬로 모션으로 담아낸다." },
  { shotSize: "Medium Shot", camera: "Slow Pan Left", description: "모델이 여유롭게 웃으며 여름 오후의 분위기를 완성한다." },
  { shotSize: "Product Shot", camera: "Slow Push-in", description: "제품을 화면 중앙에 배치하고 브랜드 카피와 함께 영상이 끝난다." },
];

function buildShots(duration: string): Shot[] {
  const count = SHOTS_BY_DURATION[duration] ?? 5;
  const seconds = parseInt(duration, 10) || 15;
  const step = seconds / count;
  return SHOT_POOL.slice(0, count).map((s, i) => ({
    number: i + 1,
    time: `${formatTime(Math.round(i * step))}–${formatTime(Math.round((i + 1) * step))}`,
    ...s,
  }));
}

export async function generateShotList(req: ShotListRequest): Promise<ShotListProject> {
  await new Promise((r) => setTimeout(r, 1200));
  return {
    title: "Peach Summer",
    concept: "A dreamy perfume commercial capturing the feeling of a warm summer afternoon.",
    visualDirection: ["Soft daylight", "Pastel tone", "Shallow depth of field"],
    aspectRatio: VERTICAL_PLATFORMS.has(req.platform) ? "Vertical 9:16" : "Horizontal 16:9",
    shots: buildShots(req.duration),
  };
}
