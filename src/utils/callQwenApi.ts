export interface FortuneResponse {
  title: string;
  content: string;
  luckyColor: {
    name: string;
    hex: string;
  };
  luckyNumber: number;
  luckyDirection: string;
  advice: string;
  areas: Array<{
    name: string;
    stars: string;
  }>;
}

export async function callQwenAPI(
  prompt: string,
  type: "fortune" | "thoughtHeart" = "fortune"
): Promise<FortuneResponse> {
  const API_KEY = process.env.ALIYUN_API_KEY;
  const MODEL_NAME = process.env.ALIYUN_MODEL || "qwen-turbo"; // qwen-turbo, qwen-plus, qwen-max

  if (!API_KEY) {
    throw new Error("API key not configured");
  }
  try {
    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "X-DashScope-SSE": "disable",
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          input: {
            messages: [
              {
                role: "system",
                content:
                  "你是一位资深的命理师，精通中国传统文化和命理学说，擅长用优美吉祥的语言为用户提供新年运势预测和祝福。",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          },
          parameters: {
            result_format: "message",
            seed: Math.floor(Math.random() * 10000),
            temperature: 0.85,
            top_p: 0.8,
            max_tokens: 500,
            repetition_penalty: 1.1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.code) {
      console.error("DashScope API Error:", data);
      throw new Error(data.message || "API returned error");
    }

    const content =
      data.output?.text ||
      data.output?.choices?.[0]?.message?.content ||
      data.choices?.[0]?.message?.content;
    console.log(typeof content);
    if (!content) {
      console.warn("No content in response:", data);
      return generateFallbackContent(type);
    }

    return content;
  } catch (error) {
    console.error("调用通义千问 API 失败:", error);
    return generateFallbackContent(type);
  }
}

type returnGenerateFallbackContentType = FortuneResponse | any;

function generateFallbackContent(
  type: string
): returnGenerateFallbackContentType {
  let fallbackResultCareer = {};
  if (type !== "thoughtHeart") {
    fallbackResultCareer = {
      title: "上签·职场得意",
      content: "事业腾飞，贵人相助，步步高升。",
      luckyColor: { name: "富贵金", hex: "#ffd700" },
      luckyNumber: 9,
      luckyDirection: "东方",
      advice: "勇于创新，把握机遇。",
      areas: [
        { name: "事业运势", stars: "★★★★★" },
        { name: "财运运势", stars: "★★★★☆" },
        { name: "人际运势", stars: "★★★★☆" },
      ],
    };
  } else {
    fallbackResultCareer = {
      ThoughtsInTheHeart: [
        "愿新年攒够勇气，开口表白不手抖！",
        "想带爸妈坐高铁，看海听浪吃海鲜～",
        "存钱买台咖啡机，晨光里煮出小确幸",
        "练会三首吉他曲，露营时弹给星星听",
        "考过教资后，站上讲台笑得超灿烂！",
        "减肥不靠节食，跳操出汗也超快乐",
        "攒够年假去敦煌，骑骆驼追落日余晖",
      ],
    };
  }
  return fallbackResultCareer;
}


function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const patterns = [
    { regex: /(事业|工作|职业|升职|加薪|创业)/g, type: "career" },
    { regex: /(健康|身体|锻炼|养生|运动|健身)/g, type: "health" },
    { regex: /(家庭|家人|父母|子女|亲情)/g, type: "family" },
    { regex: /(学习|技能|知识|考试|学业|读书)/g, type: "study" },
    { regex: /(财运|赚钱|投资|理财|财富|收入)/g, type: "wealth" },
    { regex: /(爱情|感情|恋爱|婚姻|桃花|单身)/g, type: "love" },
    { regex: /(旅行|旅游|出行|游玩|冒险)/g, type: "travel" },
    { regex: /(人际|朋友|社交|人脉|同事)/g, type: "social" },
  ];

  patterns.forEach((pattern) => {
    if (pattern.regex.test(text)) {
      keywords.push(pattern.type);
    }
  });

  return keywords.length > 0 ? keywords : ["general"];
}

export function safeParseMixedFormat(str:string) {
  try {
    return JSON.parse(str);
  } catch (jsonError) {
    try {
      const formatted = str
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
        .replace(/\/\/.*$/gm, '') 
        .replace(/,\s*}/g, '}')  
        .replace(/,\s*]/g, ']');
      return JSON.parse(formatted);
    } catch (formatError) {
      console.error('所有解析方法都失败');
      return null;
    }
  }
}