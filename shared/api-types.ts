/**
 * Shared API Types - Single source of truth for frontend/backend contracts
 * Import these types in both frontend and backend to ensure type safety
 */

// ============ Core Domain Types ============

export type HazardLevel = "red" | "yellow" | "green" | "neutral";

export type ScoreTier =
  | "Excellent"
  | "Good"
  | "Don't eat often"
  | "Limit / rarely"
  | "Treat / very infrequent"
  | "Probably avoid";

export interface IngredientFlag {
  term: string;
  level: HazardLevel;
  explain: string;
}

export interface ScoreBreakdown {
  additivesPenalty: number;
  nutritionPenalty: number;
  processingPenalty: number;
  greenBonus: number;
}

export interface Alternative {
  name: string;
  brand: string;
  score: number;
  tier: ScoreTier;
  keyDifferences: string[];
  whyBetter: string;
}

// ============ User Preferences ============

export interface UserPreferences {
  avoidArtificialColors: boolean;
  avoidArtificialSweeteners: boolean;
  avoidNitrites: boolean;
  avoidTransFats: boolean;
  avoidBHABHT: boolean;
  avoidHighFructoseCornSyrup: boolean;
  avoidMSG: boolean;
  avoidCarrageenan: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  avoidArtificialColors: false,
  avoidArtificialSweeteners: false,
  avoidNitrites: false,
  avoidTransFats: true,
  avoidBHABHT: false,
  avoidHighFructoseCornSyrup: false,
  avoidMSG: false,
  avoidCarrageenan: false,
};

// ============ API Request Types ============

export interface AnalyzeImageRequest {
  imageBase64: string;
  preferences?: UserPreferences;
}

export interface AnalyzeBarcodeRequest {
  barcode: string;
  preferences?: UserPreferences;
}

// ============ API Response Types ============

export interface AnalyzeResponse {
  productName: string;
  brand: string;
  category: string;
  ingredientsRaw: string;
  score: number;
  tier: ScoreTier;
  breakdown: ScoreBreakdown;
  flags: IngredientFlag[];
  alternatives: Alternative[];
}

export interface AnalyzeErrorResponse {
  error: "not_food" | "not_found" | "analysis_failed";
  message: string;
}

export type AnalyzeResult = AnalyzeResponse | AnalyzeErrorResponse;

// Type guard to check if response is an error
export function isAnalyzeError(result: AnalyzeResult): result is AnalyzeErrorResponse {
  return "error" in result;
}

// ============ Client-side Extended Types ============

export interface ScanResult extends AnalyzeResponse {
  id: string;
  scanDate: string;
  imageUri?: string;
  isFavorite?: boolean;
}

export interface WeeklyStats {
  weekLabel: string;
  avgScore: number;
  scanCount: number;
  startDate: string;
  endDate: string;
}
