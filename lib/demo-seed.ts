/**
 * Demo Data Seeder - Populates AsyncStorage with realistic scan data
 * for App Store screenshots. Remove after screenshots are taken.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ScanResult, UserPreferences } from "@shared/api-types";

const HISTORY_KEY = "@scanscore_history";
const PREFS_KEY = "@scanscore_preferences";
const COMPARISON_KEY = "@scanscore_comparison";

const now = new Date();
function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const demoProducts: ScanResult[] = [
  {
    id: "demo_1",
    productName: "Organic Whole Grain Oats",
    brand: "Bob's Red Mill",
    category: "Cereal & Grains",
    ingredientsRaw: "Whole grain rolled oats",
    score: 96,
    tier: "Excellent",
    breakdown: {
      additivesPenalty: 0,
      nutritionPenalty: 0,
      processingPenalty: 0,
      macroPenalty: -4,
      greenBonus: 10,
    },
    flags: [
      { term: "Whole Grain Oats", level: "green", explain: "Excellent source of fiber and complex carbohydrates. Minimally processed whole food." },
    ],
    alternatives: [],
    scanDate: daysAgo(0),
    isFavorite: true,
  },
  {
    id: "demo_2",
    productName: "Greek Yogurt",
    brand: "Chobani",
    category: "Dairy",
    ingredientsRaw: "Cultured nonfat milk, cream, live and active cultures: S. Thermophilus, L. Bulgaricus, L. Acidophilus, Bifidus, L. Casei",
    score: 91,
    tier: "Excellent",
    breakdown: {
      additivesPenalty: 0,
      nutritionPenalty: -2,
      processingPenalty: 0,
      macroPenalty: -2,
      greenBonus: 5,
    },
    flags: [
      { term: "Live Active Cultures", level: "green", explain: "Beneficial probiotics that support gut health and digestion." },
      { term: "Nonfat Milk", level: "green", explain: "Good source of protein and calcium without added fat." },
    ],
    alternatives: [],
    scanDate: daysAgo(1),
    isFavorite: true,
  },
  {
    id: "demo_3",
    productName: "Protein Bar",
    brand: "RXBAR",
    category: "Snack Bars",
    ingredientsRaw: "Dates, egg whites, cashews, almonds, natural flavors, sea salt, cocoa",
    score: 88,
    tier: "Good",
    breakdown: {
      additivesPenalty: 0,
      nutritionPenalty: -5,
      processingPenalty: -2,
      macroPenalty: -3,
      greenBonus: 8,
    },
    flags: [
      { term: "Dates", level: "green", explain: "Natural sweetener rich in fiber, potassium, and antioxidants." },
      { term: "Egg Whites", level: "green", explain: "Clean protein source with all essential amino acids." },
      { term: "Cashews", level: "green", explain: "Heart-healthy nuts rich in magnesium and healthy fats." },
      { term: "Natural Flavors", level: "yellow", explain: "Broad term that can include various processed flavor compounds. Generally safe but lacks transparency." },
    ],
    alternatives: [],
    scanDate: daysAgo(1),
    isFavorite: false,
  },
  {
    id: "demo_4",
    productName: "Original Cheerios",
    brand: "General Mills",
    category: "Breakfast Cereal",
    ingredientsRaw: "Whole grain oats, corn starch, sugar, salt, tripotassium phosphate, vitamin E (mixed tocopherols) added to preserve freshness",
    score: 74,
    tier: "Don't eat often",
    breakdown: {
      additivesPenalty: -7,
      nutritionPenalty: -10,
      processingPenalty: -4,
      macroPenalty: -5,
      greenBonus: 5,
    },
    flags: [
      { term: "Whole Grain Oats", level: "green", explain: "First ingredient is a whole grain, providing fiber and nutrients." },
      { term: "Sugar", level: "yellow", explain: "Added sugar contributes empty calories. Moderate amount in this product." },
      { term: "Tripotassium Phosphate", level: "yellow", explain: "Used as a buffering agent and emulsifier. Generally recognized as safe but is a processed additive." },
      { term: "Corn Starch", level: "yellow", explain: "Refined starch used as a thickener. Low nutritional value." },
    ],
    alternatives: [
      { name: "Organic Oat O's", brand: "Cascadian Farm", score: 85, tier: "Good", keyDifferences: ["No artificial additives", "Organic ingredients"], whyBetter: "Uses organic whole grains without synthetic additives" },
    ],
    scanDate: daysAgo(2),
    isFavorite: false,
  },
  {
    id: "demo_5",
    productName: "Crunchy Granola Bar",
    brand: "Nature Valley",
    category: "Snack Bars",
    ingredientsRaw: "Whole grain oats, sugar, canola oil, rice flour, honey, salt, brown sugar syrup, soy lecithin, baking soda, natural flavor",
    score: 64,
    tier: "Limit / rarely",
    breakdown: {
      additivesPenalty: -14,
      nutritionPenalty: -12,
      processingPenalty: -6,
      macroPenalty: -4,
      greenBonus: 4,
    },
    flags: [
      { term: "Whole Grain Oats", level: "green", explain: "Good source of fiber and whole grains." },
      { term: "Sugar", level: "red", explain: "Second ingredient, indicating high sugar content. Multiple sugar sources in this product." },
      { term: "Canola Oil", level: "yellow", explain: "Highly refined vegetable oil. While low in saturated fat, processing involves chemical solvents." },
      { term: "Brown Sugar Syrup", level: "red", explain: "Another form of added sugar, contributing to the product's high sugar load." },
      { term: "Soy Lecithin", level: "yellow", explain: "Common emulsifier derived from soybeans. Generally safe, often from GMO sources." },
      { term: "Natural Flavor", level: "yellow", explain: "Vague term that can include various processed flavor compounds." },
    ],
    alternatives: [
      { name: "Protein Bar", brand: "RXBAR", score: 88, tier: "Good", keyDifferences: ["No added sugar", "Simple ingredients", "Higher protein"], whyBetter: "Uses dates for sweetness instead of refined sugars" },
      { name: "Nut Butter Bar", brand: "KIND", score: 79, tier: "Don't eat often", keyDifferences: ["Less sugar", "More nuts", "No refined oils"], whyBetter: "Higher healthy fat content from whole nuts" },
      { name: "Organic Granola Bar", brand: "Clif Kid Z Bar", score: 72, tier: "Don't eat often", keyDifferences: ["Organic ingredients", "Less processed"], whyBetter: "Uses organic ingredients and fewer additives" },
    ],
    scanDate: daysAgo(3),
    isFavorite: false,
  },
  {
    id: "demo_6",
    productName: "Frosted Strawberry Toaster Pastries",
    brand: "Pop-Tarts",
    category: "Breakfast Pastries",
    ingredientsRaw: "Enriched flour, sugar, high fructose corn syrup, dextrose, soybean and palm oil, bleached wheat flour, Red 40, Blue 1, Yellow 6, sodium pyrophosphate, TBHQ",
    score: 23,
    tier: "Probably avoid",
    breakdown: {
      additivesPenalty: -42,
      nutritionPenalty: -25,
      processingPenalty: -10,
      macroPenalty: -8,
      greenBonus: 0,
    },
    flags: [
      { term: "High Fructose Corn Syrup", level: "red", explain: "Highly processed sweetener linked to obesity, diabetes, and metabolic syndrome. Made from corn starch through enzymatic processing." },
      { term: "Red 40", level: "red", explain: "Synthetic petroleum-based dye. Linked to hyperactivity in children. Banned or requires warning labels in the EU." },
      { term: "Blue 1", level: "red", explain: "Artificial color derived from petroleum. Some studies suggest potential links to allergic reactions and behavioral issues." },
      { term: "Yellow 6", level: "red", explain: "Petroleum-derived artificial color. Linked to hyperactivity, allergies, and is banned in some European countries." },
      { term: "TBHQ", level: "red", explain: "Tertiary butylhydroquinone - synthetic preservative derived from butane. High doses linked to stomach tumors and DNA damage in studies." },
      { term: "Dextrose", level: "yellow", explain: "Simple sugar derived from corn. Rapidly spikes blood glucose levels." },
      { term: "Palm Oil", level: "yellow", explain: "High in saturated fat. Associated with environmental concerns including deforestation." },
      { term: "Sodium Pyrophosphate", level: "yellow", explain: "Chemical leavening agent. Safe in small amounts but is a highly processed additive." },
    ],
    alternatives: [
      { name: "Organic Toaster Pastries", brand: "Nature's Path", score: 62, tier: "Limit / rarely", keyDifferences: ["No artificial colors", "Organic ingredients", "No HFCS"], whyBetter: "Uses organic ingredients without synthetic dyes or HFCS" },
    ],
    scanDate: daysAgo(4),
    isFavorite: false,
  },
  {
    id: "demo_7",
    productName: "Nacho Cheese Tortilla Chips",
    brand: "Doritos",
    category: "Chips & Snacks",
    ingredientsRaw: "Corn, vegetable oil (sunflower, canola), maltodextrin, salt, cheddar cheese, whey, monosodium glutamate, buttermilk, Romano cheese, whey protein concentrate, onion powder, corn flour, natural and artificial flavors, dextrose, tomato powder, lactose, spices, artificial color (Yellow 6, Yellow 5, Red 40), lactic acid, citric acid, sugar, garlic powder, skim milk, Red 40, Yellow 6",
    score: 31,
    tier: "Probably avoid",
    breakdown: {
      additivesPenalty: -35,
      nutritionPenalty: -18,
      processingPenalty: -10,
      macroPenalty: -6,
      greenBonus: 0,
    },
    flags: [
      { term: "Monosodium Glutamate", level: "red", explain: "Flavor enhancer that may cause headaches, flushing, and numbness in sensitive individuals. Often masks low quality ingredients." },
      { term: "Red 40", level: "red", explain: "Synthetic petroleum-based dye linked to hyperactivity in children." },
      { term: "Yellow 6", level: "red", explain: "Petroleum-derived artificial color banned in some European countries." },
      { term: "Yellow 5", level: "red", explain: "Artificial tartrazine dye. One of the most allergenic food dyes, linked to hyperactivity and asthma." },
      { term: "Maltodextrin", level: "yellow", explain: "Highly processed starch with a high glycemic index. Can spike blood sugar rapidly." },
      { term: "Natural and Artificial Flavors", level: "yellow", explain: "Vague terms that obscure actual ingredients. Artificial flavors are lab-created chemical compounds." },
    ],
    alternatives: [
      { name: "Organic Tortilla Chips", brand: "Late July", score: 72, tier: "Don't eat often", keyDifferences: ["No artificial colors", "No MSG", "Organic corn"], whyBetter: "Simple organic ingredients without synthetic additives" },
    ],
    scanDate: daysAgo(5),
    isFavorite: false,
  },
];

const demoPreferences: UserPreferences = {
  avoidArtificialColors: true,
  avoidArtificialSweeteners: true,
  avoidNitrites: false,
  avoidTransFats: true,
  avoidBHABHT: true,
  avoidHighFructoseCornSyrup: true,
  avoidMSG: false,
  avoidCarrageenan: false,
};

export async function seedDemoData(): Promise<void> {
  try {
    // Check if already seeded
    const existing = await AsyncStorage.getItem(HISTORY_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.length > 0) return; // Already has data
    }

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(demoProducts));
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(demoPreferences));

    // Pre-select comparison: Nature Valley vs RXBAR
    const comparison = {
      product1: demoProducts[4], // Nature Valley (score 64)
      product2: demoProducts[2], // RXBAR (score 88)
    };
    await AsyncStorage.setItem(COMPARISON_KEY, JSON.stringify(comparison));

    console.log("Demo data seeded successfully");
  } catch (e) {
    console.error("Failed to seed demo data:", e);
  }
}
