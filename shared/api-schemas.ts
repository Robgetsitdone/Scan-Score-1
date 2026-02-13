/**
 * Zod schemas for runtime validation of API responses
 * Use these to validate data at system boundaries
 */

import { z } from "zod";

// ============ Core Domain Schemas ============

export const HazardLevelSchema = z.enum(["red", "yellow", "green", "neutral"]);

export const ScoreTierSchema = z.enum([
  "Excellent",
  "Good",
  "Don't eat often",
  "Limit / rarely",
  "Treat / very infrequent",
  "Probably avoid",
]);

export const IngredientFlagSchema = z.object({
  term: z.string(),
  level: HazardLevelSchema,
  explain: z.string(),
});

export const ScoreBreakdownSchema = z.object({
  additivesPenalty: z.number(),
  nutritionPenalty: z.number(),
  processingPenalty: z.number(),
  macroPenalty: z.number().min(0).max(10).default(0),
  greenBonus: z.number(),
});

export const AlternativeSchema = z.object({
  name: z.string(),
  brand: z.string(),
  score: z.number().min(0).max(100),
  tier: ScoreTierSchema,
  keyDifferences: z.array(z.string()),
  whyBetter: z.string(),
});

// ============ User Preferences Schema ============

export const UserPreferencesSchema = z.object({
  avoidArtificialColors: z.boolean(),
  avoidArtificialSweeteners: z.boolean(),
  avoidNitrites: z.boolean(),
  avoidTransFats: z.boolean(),
  avoidBHABHT: z.boolean(),
  avoidHighFructoseCornSyrup: z.boolean(),
  avoidMSG: z.boolean(),
  avoidCarrageenan: z.boolean(),
});

// ============ API Request Schemas ============

export const AnalyzeImageRequestSchema = z.object({
  imageBase64: z.string().min(1),
  preferences: UserPreferencesSchema.optional(),
});

export const AnalyzeBarcodeRequestSchema = z.object({
  barcode: z.string().min(1),
  preferences: UserPreferencesSchema.optional(),
});

// ============ API Response Schemas ============

export const AnalyzeResponseSchema = z.object({
  productName: z.string(),
  brand: z.string(),
  category: z.string(),
  ingredientsRaw: z.string(),
  score: z.number().min(0).max(100),
  tier: ScoreTierSchema,
  breakdown: ScoreBreakdownSchema,
  flags: z.array(IngredientFlagSchema),
  alternatives: z.array(AlternativeSchema),
});

export const AnalyzeErrorResponseSchema = z.object({
  error: z.enum(["not_food", "not_found", "analysis_failed"]),
  message: z.string(),
});

export const AnalyzeResultSchema = z.union([
  AnalyzeResponseSchema,
  AnalyzeErrorResponseSchema,
]);

// ============ Safe Parse Helpers ============

/**
 * Safely parse and validate an analyze response
 * Returns the validated data or throws a descriptive error
 */
export function parseAnalyzeResponse(data: unknown) {
  return AnalyzeResultSchema.parse(data);
}

/**
 * Safely parse with a fallback for partial/malformed responses
 * Attempts to extract as much valid data as possible
 */
export function parseAnalyzeResponseSafe(data: unknown) {
  const result = AnalyzeResultSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  // If it's an error response, return it as-is
  const errorResult = AnalyzeErrorResponseSchema.safeParse(data);
  if (errorResult.success) {
    return errorResult.data;
  }

  // Return a generic error if parsing fails completely
  return {
    error: "analysis_failed" as const,
    message: "Invalid response format from server",
  };
}

// ============ Nutrition Data Schemas ============

export const NutritionDataSchema = z.object({
  calories: z.number().nullable(),
  fat: z.number().nullable(),
  saturatedFat: z.number().nullable(),
  carbs: z.number().nullable(),
  sugars: z.number().nullable(),
  protein: z.number().nullable(),
  fiber: z.number().nullable(),
  sodium: z.number().nullable(),
});

// ============ Comparison Schemas ============

export const ChemicalCategorySchema = z.enum([
  "preservative",
  "artificial_coloring",
  "chemical_additive",
  "other",
]);

export const ChemicalExposureInfoSchema = z.object({
  term: z.string(),
  category: ChemicalCategorySchema,
  healthImplication: z.string(),
  foundIn: z.enum(["both", "product1", "product2"]),
});

export const ComparisonWinnerSchema = z.enum(["product1", "product2", "tie"]);

export const CategoryComparisonSchema = z.object({
  winner: ComparisonWinnerSchema,
  product1Value: z.number(),
  product2Value: z.number(),
  explanation: z.string(),
});

export const ScanResultSchema = AnalyzeResponseSchema.extend({
  id: z.string(),
  scanDate: z.string(),
  imageUri: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const ScanResultWithNutritionSchema = ScanResultSchema.extend({
  nutrition: NutritionDataSchema.optional(),
});

export const ComparisonResultSchema = z.object({
  product1: ScanResultWithNutritionSchema,
  product2: ScanResultWithNutritionSchema,
  winner: ComparisonWinnerSchema,
  scoreDifference: z.number(),
  recommendation: z.string(),
  sharedFlags: z.array(IngredientFlagSchema),
  uniqueToProduct1: z.array(IngredientFlagSchema),
  uniqueToProduct2: z.array(IngredientFlagSchema),
  chemicalExposures: z.array(ChemicalExposureInfoSchema),
  categoryComparison: z.object({
    additives: CategoryComparisonSchema,
    nutrition: CategoryComparisonSchema,
    processing: CategoryComparisonSchema,
    macros: CategoryComparisonSchema,
  }),
});

export const CompareProductsRequestSchema = z.object({
  product1: ScanResultSchema,
  product2: ScanResultSchema,
});

export const CompareErrorResponseSchema = z.object({
  error: z.enum(["comparison_failed", "invalid_products"]),
  message: z.string(),
});

export const CompareResultSchema = z.union([
  ComparisonResultSchema,
  CompareErrorResponseSchema,
]);

/**
 * Safely parse comparison response
 */
export function parseComparisonResultSafe(data: unknown) {
  const result = CompareResultSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const errorResult = CompareErrorResponseSchema.safeParse(data);
  if (errorResult.success) {
    return errorResult.data;
  }

  return {
    error: "comparison_failed" as const,
    message: "Invalid comparison response from server",
  };
}
