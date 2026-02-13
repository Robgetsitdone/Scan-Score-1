/**
 * Frontend type definitions
 * Re-exports shared types for backward compatibility
 */

// Re-export all shared API types
export {
  type HazardLevel,
  type ScoreTier,
  type IngredientFlag,
  type ScoreBreakdown,
  type Alternative,
  type UserPreferences,
  type ScanResult,
  type WeeklyStats,
  type AnalyzeResponse,
  type AnalyzeErrorResponse,
  type AnalyzeResult,
  DEFAULT_PREFERENCES,
  isAnalyzeError,
  // Nutrition types
  type NutritionData,
  // Comparison types
  type ChemicalCategory,
  type ChemicalExposureInfo,
  type ComparisonWinner,
  type CategoryComparison,
  type ScanResultWithNutrition,
  type ComparisonResult,
  type ComparisonSelection,
  type CompareProductsRequest,
  type CompareProductsResponse,
  type CompareErrorResponse,
  type CompareResult,
  isCompareError,
} from "@shared/api-types";
