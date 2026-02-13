import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const { imageBase64, preferences } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const prefsText = preferences
        ? Object.entries(preferences)
            .filter(([_, v]) => v === true)
            .map(([k]) => {
              const map: Record<string, string> = {
                avoidArtificialColors: "artificial colors",
                avoidArtificialSweeteners: "artificial sweeteners",
                avoidNitrites: "nitrites/nitrates",
                avoidTransFats: "trans fats / partially hydrogenated oils",
                avoidBHABHT: "BHA/BHT",
                avoidHighFructoseCornSyrup: "high fructose corn syrup",
                avoidMSG: "MSG / monosodium glutamate",
                avoidCarrageenan: "carrageenan",
              };
              return map[k] || k;
            })
            .join(", ")
        : "";

      const userPrefsInstruction = prefsText
        ? `\n\nUSER PREFERENCES: The user wants to AVOID these ingredients (escalate them to RED if found): ${prefsText}`
        : "";

      const systemPrompt = `You are a food ingredient analyst. The user will send a photo of a food product label (ingredient list, nutrition facts, or barcode area). Your job:

1. Read ALL ingredients from the label
2. Identify the product name and brand if visible
3. Flag each notable ingredient as red (avoid), yellow (caution), or green (positive signal)
4. Calculate a deterministic health score 0-100 using this formula:
   - Start at 100
   - Additives penalty (max 45): Red additive = -25 each (cap -45), Yellow = -7 each (cap -21)
   - Nutrition penalty (max 35): Added sugar -0 to -15, Sodium -0 to -10, Sat fat -0 to -10
   - Processing penalty (max 10): minimally processed 0, processed -5, ultra-processed -10
   - Green bonus (max +10): Whole food markers +4, no added sugar +4, short list ≤5 ingredients +2
   - Final score bounded 0-100
5. Assign a tier: 90-100 "Excellent", 80-89 "Good", 70-79 "Don't eat often", 60-69 "Limit / rarely", 50-59 "Treat / very infrequent", 0-49 "Probably avoid"
6. Suggest up to 3 cleaner alternatives in the same category with higher scores

RED flags (examples): partially hydrogenated oils, potassium bromate, titanium dioxide, BVO, artificial colors (Red 40, Yellow 5, Blue 1), nitrites in processed meats
YELLOW flags (examples): artificial sweeteners (sucralose, aspartame, acesulfame K), BHA/BHT, high added sugar, excess sodium, natural flavors, carrageenan, HFCS
GREEN signals: whole grains, live cultures, short recognizable ingredient list, no artificial colors/sweeteners/preservatives, no added sugar${userPrefsInstruction}

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
{
  "productName": "string",
  "brand": "string",
  "category": "string (e.g. Yogurt, Cereal, Snack Bar)",
  "ingredientsRaw": "string (full ingredient list as read from label)",
  "score": number,
  "tier": "string (one of the tier labels)",
  "breakdown": {
    "additivesPenalty": number,
    "nutritionPenalty": number,
    "processingPenalty": number,
    "greenBonus": number
  },
  "flags": [
    {"term": "string", "level": "red|yellow|green", "explain": "string (1-2 sentence plain English explanation)"}
  ],
  "alternatives": [
    {"name": "string", "brand": "string", "score": number, "tier": "string", "keyDifferences": ["string"], "whyBetter": "string (1 sentence)"}
  ]
}

If you cannot read the label clearly, still provide your best analysis. If the image is not a food product, return: {"error": "not_food", "message": "This doesn't appear to be a food label. Please take a clear photo of a product's ingredient list or nutrition panel."}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: "Analyze this food label. Read all ingredients, flag them, score the product, and suggest alternatives.",
              },
            ],
          },
        ],
        max_completion_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content || "";

      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      const result = JSON.parse(cleaned);
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      res.status(500).json({
        error: "analysis_failed",
        message: error.message || "Failed to analyze the food label. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
