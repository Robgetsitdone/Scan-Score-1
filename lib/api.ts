/**
 * API Service Layer - Centralized API calls with type safety
 * All backend communication goes through this module
 */

import { apiRequest } from "./query-client";
import { parseAnalyzeResponseSafe } from "@shared/api-schemas";
import type {
  AnalyzeImageRequest,
  AnalyzeBarcodeRequest,
  AnalyzeResult,
  UserPreferences,
} from "@shared/api-types";

/**
 * Analyze a food label image
 * @param imageBase64 - Base64 encoded image data
 * @param preferences - Optional user preferences for ingredient flagging
 * @returns Validated analysis result or error
 */
export async function analyzeImage(
  imageBase64: string,
  preferences?: UserPreferences
): Promise<AnalyzeResult> {
  const payload: AnalyzeImageRequest = {
    imageBase64,
    preferences,
  };

  const response = await apiRequest("POST", "/api/analyze", payload);
  const data = await response.json();

  // Validate response at the boundary
  return parseAnalyzeResponseSafe(data);
}

/**
 * Analyze a product by barcode
 * @param barcode - Product barcode (EAN-13, UPC-A, etc.)
 * @param preferences - Optional user preferences for ingredient flagging
 * @returns Validated analysis result or error
 */
export async function analyzeBarcode(
  barcode: string,
  preferences?: UserPreferences
): Promise<AnalyzeResult> {
  const payload: AnalyzeBarcodeRequest = {
    barcode,
    preferences,
  };

  const response = await apiRequest("POST", "/api/analyze-barcode", payload);
  const data = await response.json();

  // Validate response at the boundary
  return parseAnalyzeResponseSafe(data);
}

/**
 * API namespace for all backend endpoints
 */
export const api = {
  analyzeImage,
  analyzeBarcode,
} as const;

export default api;
