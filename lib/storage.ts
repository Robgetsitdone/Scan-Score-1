import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanResult, UserPreferences, DEFAULT_PREFERENCES, WeeklyStats, ComparisonSelection } from "./types";

const HISTORY_KEY = "@scanscore_history";
const PREFS_KEY = "@scanscore_preferences";
const COMPARISON_KEY = "@scanscore_comparison";
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

export async function toggleFavorite(id: string): Promise<boolean> {
  const history = await getScanHistory();
  const item = history.find((h) => h.id === id);
  if (!item) return false;
  item.isFavorite = !item.isFavorite;
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return item.isFavorite;
}

export async function getFavorites(): Promise<ScanResult[]> {
  const history = await getScanHistory();
  return history.filter((item) => item.isFavorite);
}

export function getWeeklyStats(history: ScanResult[]): WeeklyStats[] {
  if (history.length === 0) return [];

  const weeks: Record<string, { scores: number[]; start: Date; end: Date }> = {};

  for (const item of history) {
    const date = new Date(item.scanDate);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const key = monday.toISOString().slice(0, 10);
    if (!weeks[key]) {
      weeks[key] = { scores: [], start: monday, end: sunday };
    }
    weeks[key].scores.push(item.score);
  }

  const result: WeeklyStats[] = Object.entries(weeks)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 8)
    .map(([_, week]) => {
      const avg = Math.round(week.scores.reduce((a, b) => a + b, 0) / week.scores.length);
      const startMonth = week.start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endMonth = week.end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        weekLabel: `${startMonth} - ${endMonth}`,
        avgScore: avg,
        scanCount: week.scores.length,
        startDate: week.start.toISOString(),
        endDate: week.end.toISOString(),
      };
    });

  return result;
}

export async function getPreferences(): Promise<UserPreferences> {
  const data = await AsyncStorage.getItem(PREFS_KEY);
  if (!data) return DEFAULT_PREFERENCES;
  return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function getComparisonSelection(): Promise<ComparisonSelection> {
  const data = await AsyncStorage.getItem(COMPARISON_KEY);
  if (!data) return { product1: null, product2: null };
  return JSON.parse(data) as ComparisonSelection;
}

export async function setComparisonSelection(selection: ComparisonSelection): Promise<void> {
  await AsyncStorage.setItem(COMPARISON_KEY, JSON.stringify(selection));
}

export async function clearComparisonSelection(): Promise<void> {
  await AsyncStorage.removeItem(COMPARISON_KEY);
}
