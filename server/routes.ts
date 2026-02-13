import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import {
  AnalyzeImageRequestSchema,
  AnalyzeBarcodeRequestSchema,
} from "@shared/api-schemas";
import type { AnalyzeResponse, AnalyzeErrorResponse } from "@shared/api-types";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parseResult = AnalyzeImageRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorResponse: AnalyzeErrorResponse = {
          error: "analysis_failed",
          message: "Invalid request: " + parseResult.error.errors[0]?.message || "Image data is required",
        };
        return res.status(400).json(errorResponse);
      }

      const { imageBase64, preferences } = parseResult.data;

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

  app.post("/api/analyze-barcode", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const parseResult = AnalyzeBarcodeRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorResponse: AnalyzeErrorResponse = {
          error: "analysis_failed",
          message: "Invalid request: " + parseResult.error.errors[0]?.message || "Barcode is required",
        };
        return res.status(400).json(errorResponse);
      }

      const { barcode, preferences } = parseResult.data;

      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const offData = await offResponse.json();

      if (offData.status !== 1 || !offData.product) {
        return res.json({ error: "not_found", message: "Product not found in database. Try taking a photo of the label instead." });
      }

      const product = offData.product;
      const productName = product.product_name || "";
      const brand = product.brands || "";
      const ingredientsText = product.ingredients_text || "";
      const categories = product.categories || "";
      const category = categories ? categories.split(",").map((c: string) => c.trim()).pop() || "" : "";

      if (!ingredientsText) {
        return res.json({ error: "not_found", message: "Product not found in database. Try taking a photo of the label instead." });
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

      const systemPrompt = `You are a food ingredient analyst. The user will provide ingredient text from a food product. Your job:

1. Analyze ALL ingredients from the provided text
2. Flag each notable ingredient as red (avoid), yellow (caution), or green (positive signal)
3. Calculate a deterministic health score 0-100 using this formula:
   - Start at 100
   - Additives penalty (max 45): Red additive = -25 each (cap -45), Yellow = -7 each (cap -21)
   - Nutrition penalty (max 35): Added sugar -0 to -15, Sodium -0 to -10, Sat fat -0 to -10
   - Processing penalty (max 10): minimally processed 0, processed -5, ultra-processed -10
   - Green bonus (max +10): Whole food markers +4, no added sugar +4, short list ≤5 ingredients +2
   - Final score bounded 0-100
4. Assign a tier: 90-100 "Excellent", 80-89 "Good", 70-79 "Don't eat often", 60-69 "Limit / rarely", 50-59 "Treat / very infrequent", 0-49 "Probably avoid"
5. Suggest up to 3 cleaner alternatives in the same category with higher scores

RED flags (examples): partially hydrogenated oils, potassium bromate, titanium dioxide, BVO, artificial colors (Red 40, Yellow 5, Blue 1), nitrites in processed meats
YELLOW flags (examples): artificial sweeteners (sucralose, aspartame, acesulfame K), BHA/BHT, high added sugar, excess sodium, natural flavors, carrageenan, HFCS
GREEN signals: whole grains, live cultures, short recognizable ingredient list, no artificial colors/sweeteners/preservatives, no added sugar${userPrefsInstruction}

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
{
  "productName": "string",
  "brand": "string",
  "category": "string (e.g. Yogurt, Cereal, Snack Bar)",
  "ingredientsRaw": "string (full ingredient list)",
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
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this food product:\n\nProduct: ${productName}\nBrand: ${brand}\nCategory: ${category}\n\nIngredients: ${ingredientsText}`,
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
      result.productName = result.productName || productName;
      result.brand = result.brand || brand;
      result.category = result.category || category;
      result.ingredientsRaw = result.ingredientsRaw || ingredientsText;

      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing barcode:", error);
      res.status(500).json({
        error: "analysis_failed",
        message: error.message || "Failed to analyze the product. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
