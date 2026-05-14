import axios from "axios";

export type AiPlan = {
  etaMinutes: number;
  distanceKm: number;
  estimatedCostInr: number;
  spoilageRisk: "low" | "medium" | "high";
  bestRoute: string;
  pickupAdvice: string;
  confidence: number;
  source: "openrouter" | "local-estimator";
  generatedAt: string;
};

function scoreText(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function fallbackPlan(input: {
  origin: string;
  destination: string;
  food: string;
  quantity: number;
  pickupWindow: string;
}): AiPlan {
  const routeScore = scoreText(`${input.origin}-${input.destination}-${input.food}-${input.pickupWindow}`);
  const food = input.food.toLowerCase();
  const isCooked = /biryani|rice|meal|cooked|curry|chicken|paneer/.test(food);
  const isBakery = /bread|bun|cake|bakery|pastry/.test(food);
  const baseDistance = 3 + (routeScore % 15);
  const trafficDelay = routeScore % 17;
  const handlingDelay = isCooked ? 9 : isBakery ? 4 : 6;
  const etaMinutes = baseDistance * 4 + trafficDelay + handlingDelay + Math.ceil(input.quantity / 18);
  const risk: AiPlan["spoilageRisk"] = etaMinutes > 70 || (isCooked && input.quantity > 55) ? "high" : etaMinutes > 42 || isCooked ? "medium" : "low";

  return {
    etaMinutes,
    distanceKm: baseDistance,
    estimatedCostInr: baseDistance * 24 + trafficDelay * 3 + Math.round(input.quantity * (isCooked ? 2.2 : 1.4)),
    spoilageRisk: risk,
    bestRoute: `${input.origin} -> ${routeScore % 2 ? "inner ring road" : "metro corridor"} -> ${routeScore % 3 ? "volunteer handoff point" : "NGO collection desk"} -> ${input.destination}`,
    pickupAdvice:
      risk === "high"
        ? `Prioritize ${input.food} within ${Math.max(25, etaMinutes - 18)} minutes, use insulated bags, and avoid batching this pickup.`
        : risk === "medium"
          ? `Assign one volunteer for ${input.quantity} meals, verify sealed packing, and complete delivery inside the pickup window.`
          : `This is a stable pickup. Batch with nearby claims if a volunteer is already moving along this route.`,
    confidence: Number((0.74 + (routeScore % 19) / 100).toFixed(2)),
    source: "local-estimator",
    generatedAt: new Date().toISOString()
  };
}

export async function createAiPlan(input: {
  origin: string;
  destination: string;
  food: string;
  quantity: number;
  pickupWindow: string;
}): Promise<AiPlan> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return fallbackPlan(input);
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content:
              "You are FoodShare logistics AI for food donation pickup. Return strict JSON only with etaMinutes, distanceKm, estimatedCostInr, spoilageRisk, bestRoute, pickupAdvice, confidence. Make values specific to the food, quantity, pickup window, origin, and destination."
          },
          {
            role: "user",
            content: JSON.stringify(input)
          }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "FoodShare AI"
        },
        timeout: 12000
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return {
      ...fallbackPlan(input),
      ...parsed,
      source: "openrouter",
      generatedAt: new Date().toISOString()
    };
  } catch {
    return fallbackPlan(input);
  }
}
