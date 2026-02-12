import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanResult, UserPreferences, DEFAULT_PREFERENCES } from "./types";

const HISTORY_KEY = "@scanscore_history";
const PREFS_KEY = "@scanscore_preferences";
const MAX_HISTORY = 50;

export async function getScanHistory(): Promise<ScanResult[]> {
  const data = await AsyncStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  return JSON.parse(data) as ScanResult[];
}

export async function saveScanResult(result: ScanResult): Promise<void> {
  const history = await getScanHistory();
  history.unshift(result);
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export async function deleteScanResult(id: string): Promise<void> {
  const history = await getScanHistory();
  const filtered = history.filter((item) => item.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export async function clearScanHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function getPreferences(): Promise<UserPreferences> {
  const data = await AsyncStorage.getItem(PREFS_KEY);
  if (!data) return DEFAULT_PREFERENCES;
  return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
