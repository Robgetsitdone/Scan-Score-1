import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import {
  AnalyzeImageRequestSchema,
  AnalyzeBarcodeRequestSchema,
  CompareProductsRequestSchema,
} from "@shared/api-schemas";
import type {
  AnalyzeErrorResponse,
  NutritionData,
  ComparisonResult,
  ChemicalExposureInfo,
  IngredientFlag,
  ScanResult,
} from "@shared/api-types";

// Performance: Configure OpenAI client with timeout
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  timeout: 60000, // 60 second timeout
  maxRetries: 2,
});

// Security: Barcode format validation (EAN-13, EAN-8, UPC-A, UPC-E)
const BARCODE_REGEX = /^[0-9]{8,14}$/;

function isValidBarcode(barcode: string): boolean {
  return BARCODE_REGEX.test(barcode);
}

// Security: Sanitize error for logging (remove potential secrets)
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}

// Performance: Fetch with timeout using AbortController
async function fetchWithTimeout(url: string, timeoutMs: number = 30000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Extract nutrition data from Open Food Facts product
function extractNutrition(product: any): NutritionData {
  const nutriments = product.nutriments || {};
  return {
    calories: nutriments["energy-kcal_100g"] ?? nutriments.energy_kcal_100g ?? null,
    fat: nutriments.fat_100g ?? null,
    saturatedFat: nutriments["saturated-fat_100g"] ?? null,
    carbs: nutriments.carbohydrates_100g ?? null,
    sugars: nutriments.sugars_100g ?? null,
    protein: nutriments.proteins_100g ?? null,
    fiber: nutriments.fiber_100g ?? null,
    sodium: nutriments.sodium_100g ? nutriments.sodium_100g * 1000 : null, // Convert g to mg
  };
}

// Build user preferences instruction
function buildPrefsInstruction(preferences: any): string {
  if (!preferences) return "";

  const prefsText = Object.entries(preferences)
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
    .join(", ");

  return prefsText
    ? `\n\nUSER PREFERENCES: The user wants to AVOID these ingredients (escalate them to RED if found): ${prefsText}`
    : "";
}

// Shared scoring prompt section
const SCORING_FORMULA = `Calculate a deterministic health score 0-100 using this formula:
   - Start at 100
   - Additives penalty (max 45): Red additive = -25 each (cap -45), Yellow = -7 each (cap -21)
   - Nutrition penalty (max 35): Added sugar -0 to -15, Sodium -0 to -10, Sat fat -0 to -10
   - Processing penalty (max 10): minimally processed 0, processed -5, ultra-processed -10
   - Macro/Calorie penalty (max 10): High calorie density (>400 kcal/100g) = -5, Poor macro balance (protein <10% of calories while carbs >70%) = -3, Very high sugar (>20g/100g) = -2. Total macro penalty capped at -10.
   - Green bonus (max +10): Whole food markers +4, no added sugar +4, short list ≤5 ingredients +2
   - Final score bounded 0-100`;

const FLAG_EXAMPLES = `RED flags (examples): partially hydrogenated oils, potassium bromate, titanium dioxide, BVO, artificial colors (Red 40, Yellow 5, Blue 1), nitrites in processed meats
YELLOW flags (examples): artificial sweeteners (sucralose, aspartame, acesulfame K), BHA/BHT, high added sugar, excess sodium, natural flavors, carrageenan, HFCS
GREEN signals: whole grains, live cultures, short recognizable ingredient list, no artificial colors/sweeteners/preservatives, no added sugar`;

const RESPONSE_FORMAT = `{
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
    "macroPenalty": number,
    "greenBonus": number
  },
  "flags": [
    {"term": "string", "level": "red|yellow|green", "explain": "string (1-2 sentence plain English explanation)"}
  ],
  "alternatives": [
    {"name": "string", "brand": "string", "score": number, "tier": "string", "keyDifferences": ["string"], "whyBetter": "string (1 sentence)"}
  ]
}`;

async function searchProductImage(productName: string, brand?: string): Promise<string | null> {
  try {
    const query = brand ? `${productName} ${brand}` : productName;
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1&fields=image_front_small_url,image_front_url`;
    const response = await fetchWithTimeout(url, 5000);
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      return data.products[0].image_front_small_url || data.products[0].image_front_url || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function enrichAlternativesWithImages(alternatives: any[]): Promise<any[]> {
  if (!alternatives || alternatives.length === 0) return alternatives;
  const enriched = await Promise.all(
    alternatives.map(async (alt: any) => {
      const imageUrl = await searchProductImage(alt.name, alt.brand);
      return { ...alt, imageUrl: imageUrl || undefined };
    })
  );
  return enriched;
}

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const parseResult = AnalyzeImageRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorResponse: AnalyzeErrorResponse = {
          error: "analysis_failed",
          message: "Invalid request: " + (parseResult.error.errors[0]?.message || "Image data is required"),
        };
        return res.status(400).json(errorResponse);
      }

      const { imageBase64, preferences } = parseResult.data;
      const userPrefsInstruction = buildPrefsInstruction(preferences);

      const systemPrompt = `You are a food ingredient analyst. The user will send a photo of a food product label (ingredient list, nutrition facts, or barcode area). Your job:

1. Read ALL ingredients from the label
2. Identify the product name and brand if visible
3. Flag each notable ingredient as red (avoid), yellow (caution), or green (positive signal)
4. ${SCORING_FORMULA}
5. Assign a tier: 90-100 "Excellent", 80-89 "Good", 70-79 "Don't eat often", 60-69 "Limit / rarely", 50-59 "Treat / very infrequent", 0-49 "Probably avoid"
6. Suggest up to 3 cleaner alternatives in the same category with higher scores

${FLAG_EXAMPLES}${userPrefsInstruction}

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
${RESPONSE_FORMAT}

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
                  detail: "low",
                },
              },
              {
                type: "text",
                text: "Analyze this food label.",
              },
            ],
          },
        ],
        max_completion_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content || "";

      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      let result;
      try {
        result = JSON.parse(cleaned);
      } catch {
        return res.status(500).json({
          error: "analysis_failed",
          message: "Failed to parse AI response. Please try again.",
        });
      }
      // Ensure macroPenalty exists for backward compatibility
      if (result.breakdown && result.breakdown.macroPenalty === undefined) {
        result.breakdown.macroPenalty = 0;
      }
      if (result.alternatives && result.alternatives.length > 0) {
        result.alternatives = await enrichAlternativesWithImages(result.alternatives);
      }
      res.json(result);
    } catch (error: unknown) {
      console.error("Error analyzing image:", sanitizeError(error));
      res.status(500).json({
        error: "analysis_failed",
        message: "Failed to analyze the food label. Please try again.",
      });
    }
  });

  app.post("/api/analyze-barcode", async (req: Request, res: Response) => {
    try {
      const parseResult = AnalyzeBarcodeRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorResponse: AnalyzeErrorResponse = {
          error: "analysis_failed",
          message: "Invalid request: " + (parseResult.error.errors[0]?.message || "Barcode is required"),
        };
        return res.status(400).json(errorResponse);
      }

      const { barcode, preferences } = parseResult.data;

      if (!isValidBarcode(barcode)) {
        return res.status(400).json({
          error: "analysis_failed",
          message: "Invalid barcode format. Please scan a valid product barcode.",
        });
      }

      const offResponse = await fetchWithTimeout(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        30000
      );
      if (!offResponse.ok) {
        return res.json({ error: "not_found", message: "Product not found in database. Try taking a photo of the label instead." });
      }
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

      // Extract nutrition data from Open Food Facts
      const nutrition = extractNutrition(product);

      if (!ingredientsText) {
        return res.json({ error: "not_found", message: "Product not found in database. Try taking a photo of the label instead." });
      }

      const userPrefsInstruction = buildPrefsInstruction(preferences);

      // Build nutrition context for the prompt
      const nutritionContext = nutrition.calories
        ? `\n\nNutrition per 100g: ${nutrition.calories} kcal, ${nutrition.protein ?? "?"}g protein, ${nutrition.carbs ?? "?"}g carbs (${nutrition.sugars ?? "?"}g sugars), ${nutrition.fat ?? "?"}g fat`
        : "";

      const systemPrompt = `You are a food ingredient analyst. The user will provide ingredient text from a food product. Your job:

1. Analyze ALL ingredients from the provided text
2. Flag each notable ingredient as red (avoid), yellow (caution), or green (positive signal)
3. ${SCORING_FORMULA}
4. Assign a tier: 90-100 "Excellent", 80-89 "Good", 70-79 "Don't eat often", 60-69 "Limit / rarely", 50-59 "Treat / very infrequent", 0-49 "Probably avoid"
5. Suggest up to 3 cleaner alternatives in the same category with higher scores

${FLAG_EXAMPLES}${userPrefsInstruction}

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
${RESPONSE_FORMAT}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Product: ${productName}\nBrand: ${brand}\nCategory: ${category}\nIngredients: ${ingredientsText}${nutritionContext}`,
          },
        ],
        max_completion_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content || "";

      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      let result;
      try {
        result = JSON.parse(cleaned);
      } catch {
        return res.status(500).json({
          error: "analysis_failed",
          message: "Failed to parse AI response. Please try again.",
        });
      }
      result.productName = result.productName || productName;
      result.brand = result.brand || brand;
      result.category = result.category || category;
      result.ingredientsRaw = result.ingredientsRaw || ingredientsText;
      // Ensure macroPenalty exists
      if (result.breakdown && result.breakdown.macroPenalty === undefined) {
        result.breakdown.macroPenalty = 0;
      }
      // Include nutrition data in response
      result.nutrition = nutrition;
      if (result.alternatives && result.alternatives.length > 0) {
        result.alternatives = await enrichAlternativesWithImages(result.alternatives);
      }

      res.json(result);
    } catch (error: unknown) {
      console.error("Error analyzing barcode:", sanitizeError(error));
      res.status(500).json({
        error: "analysis_failed",
        message: "Failed to analyze the product. Please try again.",
      });
    }
  });

  // New endpoint: Compare two products
  app.post("/api/compare", async (req: Request, res: Response) => {
    try {
      const parseResult = CompareProductsRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "invalid_products",
          message: "Invalid request: " + (parseResult.error.errors[0]?.message || "Two products required"),
        });
      }

      const { product1, product2 } = parseResult.data as { product1: ScanResult; product2: ScanResult };

      // Analyze flags to find shared and unique
      const product1FlagTerms = new Set(product1.flags.map(f => f.term.toLowerCase()));
      const product2FlagTerms = new Set(product2.flags.map(f => f.term.toLowerCase()));

      const sharedFlags: IngredientFlag[] = [];
      const uniqueToProduct1: IngredientFlag[] = [];
      const uniqueToProduct2: IngredientFlag[] = [];

      for (const flag of product1.flags) {
        if (product2FlagTerms.has(flag.term.toLowerCase())) {
          // Only add to shared once
          if (!sharedFlags.some(f => f.term.toLowerCase() === flag.term.toLowerCase())) {
            sharedFlags.push(flag);
          }
        } else {
          uniqueToProduct1.push(flag);
        }
      }

      for (const flag of product2.flags) {
        if (!product1FlagTerms.has(flag.term.toLowerCase())) {
          uniqueToProduct2.push(flag);
        }
      }

      // Determine winner
      const scoreDiff = product1.score - product2.score;
      const winner = scoreDiff > 0 ? "product1" : scoreDiff < 0 ? "product2" : "tie";

      // Build comparison prompt for chemical exposure analysis
      const comparisonPrompt = `Compare these two food products and provide analysis:

PRODUCT 1: ${product1.productName} (${product1.brand})
Score: ${product1.score}/100
Red flags: ${product1.flags.filter(f => f.level === "red").map(f => f.term).join(", ") || "None"}
Yellow flags: ${product1.flags.filter(f => f.level === "yellow").map(f => f.term).join(", ") || "None"}

PRODUCT 2: ${product2.productName} (${product2.brand})
Score: ${product2.score}/100
Red flags: ${product2.flags.filter(f => f.level === "red").map(f => f.term).join(", ") || "None"}
Yellow flags: ${product2.flags.filter(f => f.level === "yellow").map(f => f.term).join(", ") || "None"}

Shared concerning ingredients: ${sharedFlags.filter(f => f.level !== "green").map(f => f.term).join(", ") || "None"}

Provide a JSON response with:
1. chemicalExposures: Array of objects for each concerning ingredient with {term, category (preservative|artificial_coloring|chemical_additive|other), healthImplication (1-2 sentences about health concerns), foundIn (both|product1|product2)}
2. recommendation: A clear 1-2 sentence recommendation on which product to choose and why

Respond ONLY with valid JSON:
{
  "chemicalExposures": [...],
  "recommendation": "string"
}`;

      const comparisonResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a food scientist providing health analysis. Be factual and concise.",
          },
          { role: "user", content: comparisonPrompt },
        ],
        max_completion_tokens: 2048,
      });

      const comparisonContent = comparisonResponse.choices[0]?.message?.content || "";
      let comparisonCleaned = comparisonContent.trim();
      if (comparisonCleaned.startsWith("```")) {
        comparisonCleaned = comparisonCleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      let comparisonData: { chemicalExposures: ChemicalExposureInfo[]; recommendation: string };
      try {
        comparisonData = JSON.parse(comparisonCleaned);
      } catch {
        comparisonData = {
          chemicalExposures: [],
          recommendation: winner === "tie"
            ? "Both products have similar health profiles. Choose based on your taste preference."
            : `${winner === "product1" ? product1.productName : product2.productName} is the healthier choice with a higher score.`,
        };
      }

      // Build category comparisons
      const b1 = product1.breakdown;
      const b2 = product2.breakdown;

      const result: ComparisonResult = {
        product1: product1 as any,
        product2: product2 as any,
        winner: winner as "product1" | "product2" | "tie",
        scoreDifference: Math.abs(scoreDiff),
        recommendation: comparisonData.recommendation,
        sharedFlags,
        uniqueToProduct1,
        uniqueToProduct2,
        chemicalExposures: comparisonData.chemicalExposures || [],
        categoryComparison: {
          additives: {
            winner: b1.additivesPenalty < b2.additivesPenalty ? "product1" : b1.additivesPenalty > b2.additivesPenalty ? "product2" : "tie",
            product1Value: b1.additivesPenalty,
            product2Value: b2.additivesPenalty,
            explanation: `Product 1 has ${b1.additivesPenalty} additive penalty vs Product 2's ${b2.additivesPenalty}`,
          },
          nutrition: {
            winner: b1.nutritionPenalty < b2.nutritionPenalty ? "product1" : b1.nutritionPenalty > b2.nutritionPenalty ? "product2" : "tie",
            product1Value: b1.nutritionPenalty,
            product2Value: b2.nutritionPenalty,
            explanation: `Product 1 has ${b1.nutritionPenalty} nutrition penalty vs Product 2's ${b2.nutritionPenalty}`,
          },
          processing: {
            winner: b1.processingPenalty < b2.processingPenalty ? "product1" : b1.processingPenalty > b2.processingPenalty ? "product2" : "tie",
            product1Value: b1.processingPenalty,
            product2Value: b2.processingPenalty,
            explanation: `Product 1 has ${b1.processingPenalty} processing penalty vs Product 2's ${b2.processingPenalty}`,
          },
          macros: {
            winner: (b1.macroPenalty || 0) < (b2.macroPenalty || 0) ? "product1" : (b1.macroPenalty || 0) > (b2.macroPenalty || 0) ? "product2" : "tie",
            product1Value: b1.macroPenalty || 0,
            product2Value: b2.macroPenalty || 0,
            explanation: `Product 1 has ${b1.macroPenalty || 0} macro penalty vs Product 2's ${b2.macroPenalty || 0}`,
          },
        },
      };

      res.json(result);
    } catch (error: unknown) {
      console.error("Error comparing products:", sanitizeError(error));
      res.status(500).json({
        error: "comparison_failed",
        message: "Failed to compare products. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
