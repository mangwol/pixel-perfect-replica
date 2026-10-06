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
  shots: Shot[];
};

export type ShotListRequest = {
  idea: string;
  duration: string;
  platform: string;
};

export const DURATIONS = ["10 sec", "15 sec", "30 sec", "60 sec"];
export const PLATFORMS = ["Instagram Reels", "TikTok", "YouTube Shorts", "YouTube", "Other"];

const SAMPLE: ShotListProject = {
  title: "Peach Summer",
  concept: "A dreamy perfume commercial capturing the feeling of a warm summer afternoon.",
  visualDirection: ["Soft daylight", "Pastel tone", "Shallow depth of field"],
  shots: [
    { number: 1, time: "0:00–0:03", shotSize: "Extreme Close Up", camera: "Static", description: "복숭아 표면에 맺힌 물방울을 극단적인 클로즈업으로 보여준다." },
    { number: 2, time: "0:03–0:06", shotSize: "Close Up", camera: "Slow Push-in", description: "부드러운 햇빛 속에서 향수병이 천천히 화면에 등장한다." },
    { number: 3, time: "0:06–0:09", shotSize: "Medium Shot", camera: "Slow Pan Right", description: "모델이 창가에서 향수병을 들어 올린다." },
    { number: 4, time: "0:09–0:12", shotSize: "Close Up", camera: "Handheld", description: "모델이 손목에 향수를 뿌리는 순간을 자연스럽게 보여준다." },
    { number: 5, time: "0:12–0:15", shotSize: "Product Shot", camera: "Slow Push-in", description: "제품을 화면 중앙에 배치하고 브랜드 카피와 함께 영상이 끝난다." },
  ],
};

export async function generateShotList(_req: ShotListRequest): Promise<ShotListProject> {
  await new Promise((r) => setTimeout(r, 1200));
  return SAMPLE;
}
