export interface IngredientCategory {
  id: string;
  name: string;
  concept: string;
  detail: string;
  iconName: string;
  color: string;
}

export interface IngredientEducationEntry {
  term: string;
  aliases: string[];
  categoryId: string;
  shortExplain: string;
  regulatoryStatus?: string;
}

export const CATEGORIES: Record<string, IngredientCategory> = {
  artificial_sweeteners: {
    id: "artificial_sweeteners",
    name: "Artificial Sweeteners",
    concept: "Sugar substitutes that can be hundreds of times sweeter than sugar, but may carry health trade-offs your taste buds don't warn you about.",
    detail: "While they promise zero calories, research increasingly links artificial sweeteners to disrupted gut bacteria, metabolic changes, and even cancer risk. The WHO classified aspartame as 'possibly carcinogenic' in 2023. Plant-derived options like stevia and monk fruit are generally considered safer alternatives.",
    iconName: "water-outline",
    color: "#8B5CF6",
  },
  emulsifiers: {
    id: "emulsifiers",
    name: "Emulsifiers",
    concept: "Additives that keep ingredients from separating — think oil and water staying mixed — but they may also break down your gut's protective barriers.",
    detail: "Emulsifiers like polysorbate 80 and carboxymethylcellulose have been shown to thin the intestinal mucus layer that protects your gut lining. A large study of 92,000+ participants linked mono- and diglycerides to a 15% increased cancer risk. Carrageenan was removed from organic food standards due to safety concerns.",
    iconName: "layers-outline",
    color: "#EC4899",
  },
  preservatives: {
    id: "preservatives",
    name: "Preservatives",
    concept: "Chemicals that extend shelf life by preventing spoilage, but some have been linked to cancer and organ damage at higher exposures.",
    detail: "BHA has been listed as a carcinogen in California since 1990, and the FDA is reassessing it in 2026. Sodium benzoate can form benzene (a known carcinogen) when combined with vitamin C. Sodium nitrite and nitrate form cancer-causing nitrosamines inside the body.",
    iconName: "shield-outline",
    color: "#EF4444",
  },
  artificial_colors: {
    id: "artificial_colors",
    name: "Artificial Colors",
    concept: "Synthetic dyes that make food look more appealing but offer zero nutritional value — and several are being banned or phased out worldwide.",
    detail: "Red No. 3 was banned in the US in January 2025 as a genotoxic carcinogen, and the FDA has planned phase-outs for several more dyes. The EU requires hyperactivity warnings on foods containing Yellow No. 5 and Yellow No. 6. Titanium dioxide has been banned in the EU since 2022 but remains FDA-approved in the US.",
    iconName: "color-palette-outline",
    color: "#F59E0B",
  },
  flavor_enhancers: {
    id: "flavor_enhancers",
    name: "Flavor Enhancers",
    concept: "Additives designed to make food taste better, often by triggering umami receptors — but many are hidden forms of MSG or contain undisclosed chemicals.",
    detail: "Ingredients like hydrolyzed vegetable protein and autolyzed yeast contain free glutamates, effectively acting as hidden MSG sources. 'Natural flavors' can be 80-90% solvents and additives, potentially containing 100+ undisclosed chemicals. Diacetyl, a butter flavoring, causes an incurable lung disease known as 'popcorn lung.'",
    iconName: "restaurant-outline",
    color: "#F97316",
  },
  thickeners: {
    id: "thickeners",
    name: "Thickeners",
    concept: "Substances that give processed foods a desirable texture, ranging from generally safe natural gums to chemically modified starches.",
    detail: "Modified food starch can have a higher glycemic index than table sugar, spiking blood sugar despite sounding harmless. Xanthan gum and guar gum are generally considered safe, with guar gum potentially offering prebiotic benefits. These are among the less concerning additives when naturally derived.",
    iconName: "ellipsis-horizontal-outline",
    color: "#6366F1",
  },
  hidden_sugars: {
    id: "hidden_sugars",
    name: "Hidden Sugars",
    concept: "Sugars disguised under unfamiliar names that make processed foods seem healthier than they are — your body processes them the same way.",
    detail: "High fructose corn syrup promotes liver fat and insulin resistance and serves as a reliable marker for ultra-processed food. Maltodextrin has a higher glycemic index than table sugar despite being marketed as a 'complex carbohydrate.' Names like 'evaporated cane juice' and 'fruit juice concentrate' are essentially sugar with healthier-sounding labels.",
    iconName: "cube-outline",
    color: "#D946EF",
  },
  processing_aids: {
    id: "processing_aids",
    name: "Processing Aids",
    concept: "Industrial chemicals used during food manufacturing that may leave residues in the final product — many are banned in other countries.",
    detail: "Hexane, a neurotoxin used for oil extraction, can leave residues in food and is banned in organic production. Potassium bromate is a genotoxic carcinogen banned in most countries but still used in the US until California's ban takes effect in 2027. Azodicarbonamide breaks down into cancer-linked chemicals and is banned in the EU.",
    iconName: "construct-outline",
    color: "#64748B",
  },
  trans_fats: {
    id: "trans_fats",
    name: "Trans Fats",
    concept: "Industrially produced fats strongly linked to heart disease that were effectively banned in 2018, but trace amounts and newer replacements still appear in food.",
    detail: "Partially hydrogenated oils were the primary source of artificial trans fats and are now largely banned, though trace amounts can still be present. Fully hydrogenated oils are saturated fats that still carry cardiovascular risk. Interesterified fats are a newer replacement with limited long-term safety data available.",
    iconName: "heart-dislike-outline",
    color: "#DC2626",
  },
  flour_bleaching: {
    id: "flour_bleaching",
    name: "Flour Bleaching",
    concept: "Chemical agents used to whiten flour and speed up aging, destroying nutrients in the process — most are banned in the EU.",
    detail: "Chlorine gas bleaches flour while destroying vitamins and is banned in the EU. Benzoyl peroxide generates reactive oxygen species during the bleaching process. These chemicals are used purely for cosmetic and processing speed purposes, offering no benefit to consumers.",
    iconName: "flash-outline",
    color: "#A3A3A3",
  },
};

export const INGREDIENTS: IngredientEducationEntry[] = [
  {
    term: "Aspartame",
    aliases: ["NutraSweet", "Equal", "AminoSweet"],
    categoryId: "artificial_sweeteners",
    shortExplain: "Artificial sweetener classified as 'possibly carcinogenic' (Group 2B) by the WHO in 2023.",
    regulatoryStatus: "WHO Group 2B carcinogen (2023)",
  },
  {
    term: "Sucralose",
    aliases: ["Splenda"],
    categoryId: "artificial_sweeteners",
    shortExplain: "Synthetic sweetener 600x sweeter than sugar, linked to altered gut bacteria and increased coronary artery disease risk.",
  },
  {
    term: "Acesulfame Potassium",
    aliases: ["Acesulfame-K", "Sunett", "Sweet One"],
    categoryId: "artificial_sweeteners",
    shortExplain: "Artificial sweetener linked to cancer risk in a 2022 study and potential early puberty in children.",
  },
  {
    term: "Saccharin",
    aliases: ["Sweet'N Low"],
    categoryId: "artificial_sweeteners",
    shortExplain: "The oldest artificial sweetener, once listed as a carcinogen but delisted in 2000 after further review.",
    regulatoryStatus: "Delisted as carcinogen in 2000",
  },
  {
    term: "Stevia",
    aliases: ["Rebaudioside A", "Steviol Glycosides"],
    categoryId: "artificial_sweeteners",
    shortExplain: "Plant-derived sweetener generally considered safer than synthetic alternatives, though long-term data remains limited.",
  },
  {
    term: "Monk Fruit Extract",
    aliases: [],
    categoryId: "artificial_sweeteners",
    shortExplain: "Plant-derived sweetener generally considered safe with no major health concerns identified to date.",
  },
  {
    term: "Carboxymethylcellulose",
    aliases: ["CMC", "Cellulose Gum", "E466"],
    categoryId: "emulsifiers",
    shortExplain: "Emulsifier shown to thin the intestinal mucus layer, linked to leaky gut and intestinal inflammation.",
  },
  {
    term: "Polysorbate 80",
    aliases: ["Tween 80", "E433"],
    categoryId: "emulsifiers",
    shortExplain: "Emulsifier linked to gut damage and intergenerational health impacts in animal studies.",
  },
  {
    term: "Polysorbate 60",
    aliases: ["Tween 60"],
    categoryId: "emulsifiers",
    shortExplain: "Emulsifier in the same chemical family as Polysorbate 80, sharing similar gut health concerns.",
  },
  {
    term: "Carrageenan",
    aliases: ["Irish Moss", "E407"],
    categoryId: "emulsifiers",
    shortExplain: "Seaweed-derived emulsifier linked to cancer risk in a 2024 study and removed from organic food standards.",
    regulatoryStatus: "Removed from USDA organic standards",
  },
  {
    term: "Mono- and Diglycerides",
    aliases: ["E471"],
    categoryId: "emulsifiers",
    shortExplain: "Common emulsifier associated with a 15% increased cancer risk in a study of over 92,000 participants.",
  },
  {
    term: "Soy Lecithin",
    aliases: ["E322"],
    categoryId: "emulsifiers",
    shortExplain: "Emulsifier typically extracted using hexane, a neurotoxin solvent, with potential residue concerns.",
  },
  {
    term: "BHA",
    aliases: ["Butylated Hydroxyanisole"],
    categoryId: "preservatives",
    shortExplain: "Preservative listed as a carcinogen in California since 1990, with the FDA reassessing its safety in 2026.",
    regulatoryStatus: "California-listed carcinogen since 1990; FDA reassessing 2026",
  },
  {
    term: "BHT",
    aliases: ["Butylated Hydroxytoluene"],
    categoryId: "preservatives",
    shortExplain: "Synthetic preservative restricted in UK cosmetics as of 2024 due to safety concerns.",
    regulatoryStatus: "UK restricted in cosmetics (2024)",
  },
  {
    term: "TBHQ",
    aliases: ["Tert-butylhydroquinone"],
    categoryId: "preservatives",
    shortExplain: "Preservative linked to cancer and liver enlargement at higher doses in animal studies.",
  },
  {
    term: "Sodium Benzoate",
    aliases: ["E211"],
    categoryId: "preservatives",
    shortExplain: "Preservative that can form benzene, a known carcinogen, when combined with vitamin C in beverages.",
  },
  {
    term: "Sodium Nitrite",
    aliases: ["E250"],
    categoryId: "preservatives",
    shortExplain: "Curing agent that forms cancer-causing nitrosamines inside the body during digestion.",
  },
  {
    term: "Sodium Nitrate",
    aliases: ["E251"],
    categoryId: "preservatives",
    shortExplain: "Preservative that converts to nitrite in the body, carrying the same nitrosamine cancer risk.",
  },
  {
    term: "Potassium Sorbate",
    aliases: ["E202"],
    categoryId: "preservatives",
    shortExplain: "Widely used preservative with emerging concerns about reproductive and developmental toxicity.",
  },
  {
    term: "Red No. 3",
    aliases: ["Erythrosine", "Red 3", "FD&C Red No. 3"],
    categoryId: "artificial_colors",
    shortExplain: "Synthetic red dye banned in the US as of January 2025 after being identified as a genotoxic carcinogen.",
    regulatoryStatus: "BANNED in US (January 2025)",
  },
  {
    term: "Red No. 40",
    aliases: ["Allura Red", "E129", "Red 40", "FD&C Red No. 40"],
    categoryId: "artificial_colors",
    shortExplain: "The most widely used red dye in the US, linked to hyperactivity in children with an FDA phase-out planned.",
    regulatoryStatus: "FDA phase-out planned",
  },
  {
    term: "Yellow No. 5",
    aliases: ["Tartrazine", "E102", "Yellow 5", "FD&C Yellow No. 5"],
    categoryId: "artificial_colors",
    shortExplain: "Synthetic dye requiring hyperactivity warnings in the EU and associated with allergic reactions.",
    regulatoryStatus: "EU requires hyperactivity warning",
  },
  {
    term: "Yellow No. 6",
    aliases: ["Sunset Yellow", "E110", "Yellow 6", "FD&C Yellow No. 6"],
    categoryId: "artificial_colors",
    shortExplain: "Synthetic dye with the same hyperactivity and allergy concerns as Yellow No. 5.",
    regulatoryStatus: "EU requires hyperactivity warning",
  },
  {
    term: "Blue No. 1",
    aliases: ["Brilliant Blue", "E133", "Blue 1", "FD&C Blue No. 1"],
    categoryId: "artificial_colors",
    shortExplain: "Synthetic blue dye on the FDA's planned phase-out list due to safety concerns.",
    regulatoryStatus: "On FDA phase-out list",
  },
  {
    term: "Blue No. 2",
    aliases: ["Indigo Carmine", "E132", "Blue 2", "FD&C Blue No. 2"],
    categoryId: "artificial_colors",
    shortExplain: "Synthetic dye derived from indigo, on the FDA's planned phase-out list.",
    regulatoryStatus: "On FDA phase-out list",
  },
  {
    term: "Green No. 3",
    aliases: ["Fast Green", "E143", "Green 3", "FD&C Green No. 3"],
    categoryId: "artificial_colors",
    shortExplain: "Synthetic green dye on the FDA's planned phase-out list for food use.",
    regulatoryStatus: "On FDA phase-out list",
  },
  {
    term: "Titanium Dioxide",
    aliases: ["E171"],
    categoryId: "artificial_colors",
    shortExplain: "White coloring agent banned in the EU since 2022 due to genotoxicity concerns but still FDA-approved in the US.",
    regulatoryStatus: "Banned in EU (2022); FDA-approved in US",
  },
  {
    term: "Caramel Coloring",
    aliases: ["4-MEI", "Caramel Color"],
    categoryId: "artificial_colors",
    shortExplain: "Common brown coloring that contains 4-MEI, a possibly carcinogenic compound listed under California Prop 65.",
    regulatoryStatus: "California Prop 65 listed",
  },
  {
    term: "MSG",
    aliases: ["Monosodium Glutamate", "E621"],
    categoryId: "flavor_enhancers",
    shortExplain: "Flavor enhancer that triggers umami taste, known to cause headaches and flushing in sensitive individuals.",
  },
  {
    term: "Hydrolyzed Vegetable Protein",
    aliases: ["HVP"],
    categoryId: "flavor_enhancers",
    shortExplain: "Protein broken down into free glutamates, functioning as a hidden source of MSG in processed foods.",
  },
  {
    term: "Hydrolyzed Soy Protein",
    aliases: [],
    categoryId: "flavor_enhancers",
    shortExplain: "Soy-based protein containing free glutamates that acts as a hidden MSG source in food products.",
  },
  {
    term: "Autolyzed Yeast",
    aliases: ["Yeast Extract"],
    categoryId: "flavor_enhancers",
    shortExplain: "Flavor ingredient rich in glutamates, commonly used as a hidden MSG source in processed foods.",
  },
  {
    term: "Natural Flavors",
    aliases: [],
    categoryId: "flavor_enhancers",
    shortExplain: "Umbrella term for flavoring that can be 80-90% solvents and additives, potentially containing 100+ undisclosed chemicals.",
  },
  {
    term: "Diacetyl",
    aliases: [],
    categoryId: "flavor_enhancers",
    shortExplain: "Butter flavoring chemical that causes 'popcorn lung,' an incurable and potentially fatal lung disease.",
  },
  {
    term: "Modified Food Starch",
    aliases: ["E1404", "E1450", "E1452"],
    categoryId: "thickeners",
    shortExplain: "Chemically altered starch with a higher glycemic index than table sugar, causing rapid blood sugar spikes.",
  },
  {
    term: "Xanthan Gum",
    aliases: ["E415"],
    categoryId: "thickeners",
    shortExplain: "Fermentation-derived thickener generally considered safe and widely used in gluten-free products.",
  },
  {
    term: "Guar Gum",
    aliases: ["E412"],
    categoryId: "thickeners",
    shortExplain: "Plant-derived thickener generally considered safe, with potential prebiotic benefits for gut health.",
  },
  {
    term: "Locust Bean Gum",
    aliases: ["Carob Gum", "E410"],
    categoryId: "thickeners",
    shortExplain: "Natural thickener derived from carob seeds, generally considered safe for consumption.",
  },
  {
    term: "High Fructose Corn Syrup",
    aliases: ["HFCS", "Corn Syrup"],
    categoryId: "hidden_sugars",
    shortExplain: "Highly processed sweetener that promotes liver fat and insulin resistance, and is a reliable marker for ultra-processed food.",
  },
  {
    term: "Maltodextrin",
    aliases: [],
    categoryId: "hidden_sugars",
    shortExplain: "Starch-derived additive with a higher glycemic index than sugar despite being misleadingly called a 'complex carbohydrate.'",
  },
  {
    term: "Dextrose",
    aliases: ["Corn Sugar"],
    categoryId: "hidden_sugars",
    shortExplain: "Simple sugar chemically identical to blood glucose, rapidly absorbed and spiking blood sugar levels.",
  },
  {
    term: "Agave Nectar",
    aliases: ["Agave Syrup"],
    categoryId: "hidden_sugars",
    shortExplain: "Marketed as a healthy sweetener but contains more fructose than high fructose corn syrup.",
  },
  {
    term: "Brown Rice Syrup",
    aliases: [],
    categoryId: "hidden_sugars",
    shortExplain: "Alternative sweetener that often contains trace amounts of arsenic from rice cultivation.",
  },
  {
    term: "Evaporated Cane Juice",
    aliases: [],
    categoryId: "hidden_sugars",
    shortExplain: "Essentially just sugar with a healthier-sounding name used to make products appear more natural.",
  },
  {
    term: "Fruit Juice Concentrate",
    aliases: [],
    categoryId: "hidden_sugars",
    shortExplain: "Concentrated sugar stripped of most nutrients, used to sweeten products while appearing wholesome on labels.",
  },
  {
    term: "Hexane",
    aliases: [],
    categoryId: "processing_aids",
    shortExplain: "Neurotoxic solvent used for oil extraction that can leave residues in food, banned in organic production.",
    regulatoryStatus: "Banned in organic production",
  },
  {
    term: "Chlorine Gas",
    aliases: ["Chlorine Dioxide"],
    categoryId: "processing_aids",
    shortExplain: "Industrial bleaching agent used on flour that destroys vitamins and is banned for food use in the EU.",
    regulatoryStatus: "Banned in EU for food use",
  },
  {
    term: "Benzoyl Peroxide",
    aliases: [],
    categoryId: "processing_aids",
    shortExplain: "Flour bleaching agent that generates reactive oxygen species, used purely for cosmetic whitening of flour.",
  },
  {
    term: "Potassium Bromate",
    aliases: ["E924"],
    categoryId: "processing_aids",
    shortExplain: "Genotoxic carcinogen used in bread-making, banned in most countries and set to be banned in California by 2027.",
    regulatoryStatus: "Banned in most countries; California ban effective 2027",
  },
  {
    term: "Azodicarbonamide",
    aliases: ["ADA", "E927a"],
    categoryId: "processing_aids",
    shortExplain: "Dough conditioner that breaks down into cancer-linked chemicals during baking, banned in the EU and Australia.",
    regulatoryStatus: "Banned in EU and Australia",
  },
  {
    term: "Partially Hydrogenated Oils",
    aliases: ["PHOs"],
    categoryId: "trans_fats",
    shortExplain: "Primary source of artificial trans fats effectively banned since 2018, though trace amounts can still appear in food.",
    regulatoryStatus: "Effectively banned in US since 2018",
  },
  {
    term: "Fully Hydrogenated Oils",
    aliases: [],
    categoryId: "trans_fats",
    shortExplain: "Saturated fats created through complete hydrogenation that still carry significant cardiovascular risk.",
  },
  {
    term: "Interesterified Fats",
    aliases: [],
    categoryId: "trans_fats",
    shortExplain: "Newer trans fat replacements with limited long-term safety data, increasingly used in processed foods.",
  },
];

export function findEducation(
  flagTerm: string
): { ingredient: IngredientEducationEntry; category: IngredientCategory } | null {
  const normalized = flagTerm.toLowerCase().trim();
  if (!normalized) return null;

  for (const ingredient of INGREDIENTS) {
    const termLower = ingredient.term.toLowerCase();
    const allNames = [termLower, ...ingredient.aliases.map((a) => a.toLowerCase())];

    for (const name of allNames) {
      if (name === normalized || name.includes(normalized) || normalized.includes(name)) {
        const category = CATEGORIES[ingredient.categoryId];
        if (category) {
          return { ingredient, category };
        }
      }
    }
  }

  return null;
}

export function getRelevantCategories(
  flagTerms: string[]
): {
  category: IngredientCategory;
  matchedIngredients: { ingredient: IngredientEducationEntry; flagTerm: string }[];
}[] {
  const categoryMap = new Map<
    string,
    {
      category: IngredientCategory;
      matchedIngredients: { ingredient: IngredientEducationEntry; flagTerm: string }[];
    }
  >();

  for (const flagTerm of flagTerms) {
    const result = findEducation(flagTerm);
    if (!result) continue;

    const { ingredient, category } = result;
    const existing = categoryMap.get(category.id);

    if (existing) {
      const alreadyMatched = existing.matchedIngredients.some(
        (m) => m.ingredient.term === ingredient.term && m.flagTerm === flagTerm
      );
      if (!alreadyMatched) {
        existing.matchedIngredients.push({ ingredient, flagTerm });
      }
    } else {
      categoryMap.set(category.id, {
        category,
        matchedIngredients: [{ ingredient, flagTerm }],
      });
    }
  }

  return Array.from(categoryMap.values());
}
