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
} from "@shared/api-types";
