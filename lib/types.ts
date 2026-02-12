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

export interface ScanResult {
  id: string;
  productName: string;
  brand: string;
  category: string;
  score: number;
  tier: ScoreTier;
  breakdown: ScoreBreakdown;
  flags: IngredientFlag[];
  alternatives: Alternative[];
  ingredientsRaw: string;
  scanDate: string;
  imageUri?: string;
}

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
