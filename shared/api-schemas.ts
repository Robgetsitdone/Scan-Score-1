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
