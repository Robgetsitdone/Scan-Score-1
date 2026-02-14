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
  macroPenalty: number;  // 0-10 points for calorie/macro balance
  greenBonus: number;
}

export interface Alternative {
  name: string;
  brand: string;
  score: number;
  tier: ScoreTier;
  keyDifferences: string[];
  whyBetter: string;
  imageUrl?: string;
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

// ============ Nutrition Data (from Open Food Facts) ============

export interface NutritionData {
  calories: number | null;       // kcal per 100g
  fat: number | null;            // g per 100g
  saturatedFat: number | null;   // g per 100g
  carbs: number | null;          // g per 100g
  sugars: number | null;         // g per 100g
  protein: number | null;        // g per 100g
  fiber: number | null;          // g per 100g
  sodium: number | null;         // mg per 100g
}

// ============ Product Comparison Types ============

export type ChemicalCategory = "preservative" | "artificial_coloring" | "chemical_additive" | "other";

export interface ChemicalExposureInfo {
  term: string;
  category: ChemicalCategory;
  healthImplication: string;
  foundIn: "both" | "product1" | "product2";
}

export type ComparisonWinner = "product1" | "product2" | "tie";

export interface CategoryComparison {
  winner: ComparisonWinner;
  product1Value: number;
  product2Value: number;
  explanation: string;
}

export interface ScanResultWithNutrition extends ScanResult {
  nutrition?: NutritionData;
}

export interface ComparisonResult {
  product1: ScanResultWithNutrition;
  product2: ScanResultWithNutrition;

  // Overall comparison
  winner: ComparisonWinner;
  scoreDifference: number;
  recommendation: string;

  // Flag analysis
  sharedFlags: IngredientFlag[];
  uniqueToProduct1: IngredientFlag[];
  uniqueToProduct2: IngredientFlag[];

  // Chemical exposure breakdown
  chemicalExposures: ChemicalExposureInfo[];

  // Category-by-category comparison
  categoryComparison: {
    additives: CategoryComparison;
    nutrition: CategoryComparison;
    processing: CategoryComparison;
    macros: CategoryComparison;
  };
}

// Comparison selection state for UI
export interface ComparisonSelection {
  product1: ScanResult | null;
  product2: ScanResult | null;
}

// ============ Comparison API Types ============

export interface CompareProductsRequest {
  product1: ScanResult;
  product2: ScanResult;
}

export interface CompareProductsResponse extends ComparisonResult {}

export interface CompareErrorResponse {
  error: "comparison_failed" | "invalid_products";
  message: string;
}

export type CompareResult = CompareProductsResponse | CompareErrorResponse;

export function isCompareError(result: CompareResult): result is CompareErrorResponse {
  return "error" in result;
}
