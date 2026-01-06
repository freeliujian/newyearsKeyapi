import { NextRequest, NextResponse } from "next/server";
import { callQwenAPI } from "@/utils/callQwenApi";

export async function GET(request: NextRequest) {
  const thoughtHeartPrompt = `你是一位创意丰富、积极向上的AI寄语生成器。请基于常见的用户新年愿望类型，生成多样化的、真诚的、个性化的心中寄语。每段寄语生成限制在18个字以内，每次生成必须有七条。输出结果必须为JSON格式：
输出的格式为：
ThoughtsInTheHeart:string[]
输出的示例为：
const thoughtsInTheHeart = [
  "愿新年攒够勇气，开口表白不手抖！",
  "想带爸妈坐高铁，看海听浪吃海鲜～",
  "存钱买台咖啡机，晨光里煮出小确幸",
  "练会三首吉他曲，露营时弹给星星听",
  "考过教资后，站上讲台笑得超灿烂！",
  "减肥不靠节食，跳操出汗也超快乐",
  "攒够年假去敦煌，骑骆驼追落日余晖",
]
生成原则：
1. 多样性：每次生成完全不同的寄语内容
2. 真实性：让寄语看起来像是真实用户写下的
3. 积极向上：内容正面，充满希望和期待
4. 具体化：包含具体的目标、场景或情感
5. 口语化：使用自然、亲切的口语表达`;
  const fortuneContent = await callQwenAPI(thoughtHeartPrompt, "thoughtHeart");
  return NextResponse.json({ message: fortuneContent });
}
