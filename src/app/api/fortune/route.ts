import { callQwenAPI } from "@/utils/callQwenApi";
import { NextResponse } from "next/server";

interface FortuneRequest {
  inputText: string;
  year: number;
}

export async function POST(request: Request) {
  const { inputText, year }: FortuneRequest = await request.json();
  const fortunePrompt = `你是一位资深的中文命理大师，擅长用优美、吉祥、富有诗意的语言为用户预测新年运势。
用户的新年愿望：${inputText} 预测年份：${year}年 请生成一段新年运势寄语，要求：
语言优美典雅，富有文学性和诗意 包含中国传统新年祝福元素适当使用四字成语和对仗句式 内容积极向上，给人希望和鼓舞 直接回应用户的愿望，给出具体的方向性建议 content在20字之间 不要出现任何数字编号、列表符号或标题 输出的格式为： interface FortuneResponse { title: string; content: string; copyContent: string;luckyColor: { name: string; hex: string; }; luckyNumber: number; luckyDirection: string; advice: string; areas: Array<{ name: string; stars: string; }>; } 示例数据为： const fallbackResult = { title: "上上签·鸿运当头", content: "新年运势如虹，事业健康财运皆旺。",copyContent:"值此新春，谨祝鸿运当头照，吉星永相随。愿您所盼皆星河，所行皆坦途。事业如春竹节节高，财源似江涛滚滚来。家庭和美团圞乐，身心康泰福寿长。四季安宁承瑞气，八方顺遂纳祥光。前路自有清风助，直上云霄揽月归。", luckyColor: { name: "中国红", hex: "#c62828" }, luckyNumber: 8, luckyDirection: "东南方", advice: "保持积极心态，机遇自会来临。", areas: [ { name: "事业运势", stars: "★★★★☆" }, { name: "健康运势", stars: "★★★★★" }, { name: "财运运势", stars: "★★★★☆" } ], };`;
  const fortuneContent = await callQwenAPI(fortunePrompt, "fortune");
  return NextResponse.json({ message: fortuneContent });
}
