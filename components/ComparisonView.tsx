import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ComparisonResult } from "@/lib/types";
import ComparisonHeader from "./ComparisonHeader";
import CategoryComparisonCard from "./CategoryComparisonCard";
import ChemicalExposureCard from "./ChemicalExposureCard";
import NutritionTable from "./NutritionTable";
import IngredientTag from "./IngredientTag";

interface ComparisonViewProps {
  result: ComparisonResult;
  onCompareAgain: () => void;
}

export default function ComparisonView({ result, onCompareAgain }: ComparisonViewProps) {
  const insets = useSafeAreaInsets();

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const winnerName = result.winner === "product1"
      ? result.product1.productName
      : result.winner === "product2"
        ? result.product2.productName
        : "Neither";

    let message = `Product Comparison\n\n`;
    message += `${result.product1.productName}: ${result.product1.score}/100\n`;
    message += `${result.product2.productName}: ${result.product2.score}/100\n\n`;
    message += `Winner: ${winnerName}\n`;
    message += `${result.recommendation}\n\n`;
    message += `Compared with Score the Label`;

    try {
      await Share.share({ message });
    } catch (_) {}
  }, [result]);

  return (
    <View style={styles.container}>
      {/* Top Actions */}
      <View
        style={[
          styles.topActions,
          { top: Platform.OS === "web" ? 67 + 8 : insets.top + 8 },
        ]}
      >
        <Pressable onPress={handleShare} hitSlop={12} style={styles.topIconBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.light.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === "web" ? 67 + 60 : insets.top + 60,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with score circles */}
        <ComparisonHeader
          product1={result.product1}
          product2={result.product2}
          winner={result.winner}
        />

        {/* Recommendation */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.recommendationTitle}>Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>{result.recommendation}</Text>
        </View>

        {/* Category Comparisons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryGrid}>
            <CategoryComparisonCard
              title="Additives"
              icon="flask-outline"
              comparison={result.categoryComparison.additives}
              product1Name={result.product1.productName}
              product2Name={result.product2.productName}
            />
            <CategoryComparisonCard
              title="Nutrition"
              icon="nutrition-outline"
              comparison={result.categoryComparison.nutrition}
              product1Name={result.product1.productName}
              product2Name={result.product2.productName}
            />
            <CategoryComparisonCard
              title="Processing"
              icon="construct-outline"
              comparison={result.categoryComparison.processing}
              product1Name={result.product1.productName}
              product2Name={result.product2.productName}
            />
            <CategoryComparisonCard
              title="Macros"
              icon="pie-chart-outline"
              comparison={result.categoryComparison.macros}
              product1Name={result.product1.productName}
              product2Name={result.product2.productName}
            />
          </View>
        </View>

        {/* Chemical Exposures */}
        {result.chemicalExposures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chemical Exposure Analysis</Text>
            <View style={styles.chemicalList}>
              {result.chemicalExposures.map((exposure, index) => (
                <ChemicalExposureCard
                  key={`${exposure.term}-${index}`}
                  exposure={exposure}
                  product1Name={result.product1.productName}
                  product2Name={result.product2.productName}
                />
              ))}
            </View>
          </View>
        )}

        {/* Shared Flags */}
        {result.sharedFlags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.flagHeader}>
              <Ionicons name="alert-circle" size={18} color={Colors.light.yellow} />
              <Text style={styles.sectionTitle}>Found in Both ({result.sharedFlags.length})</Text>
            </View>
            <View style={styles.flagGrid}>
              {result.sharedFlags.map((flag, idx) => (
                <IngredientTag key={`shared-${idx}`} flag={flag} />
              ))}
            </View>
          </View>
        )}

        {/* Unique to Product 1 */}
        {result.uniqueToProduct1.length > 0 && (
          <View style={styles.section}>
            <View style={styles.flagHeader}>
              <View style={[styles.productBadge, { backgroundColor: Colors.light.tintLight }]}>
                <Text style={[styles.productBadgeText, { color: Colors.light.tint }]}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>
                Only in {result.product1.productName} ({result.uniqueToProduct1.length})
              </Text>
            </View>
            <View style={styles.flagGrid}>
              {result.uniqueToProduct1.map((flag, idx) => (
                <IngredientTag key={`p1-${idx}`} flag={flag} />
              ))}
            </View>
          </View>
        )}

        {/* Unique to Product 2 */}
        {result.uniqueToProduct2.length > 0 && (
          <View style={styles.section}>
            <View style={styles.flagHeader}>
              <View style={[styles.productBadge, { backgroundColor: Colors.light.scoreLimit + "20" }]}>
                <Text style={[styles.productBadgeText, { color: Colors.light.scoreLimit }]}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>
                Only in {result.product2.productName} ({result.uniqueToProduct2.length})
              </Text>
            </View>
            <View style={styles.flagGrid}>
              {result.uniqueToProduct2.map((flag, idx) => (
                <IngredientTag key={`p2-${idx}`} flag={flag} />
              ))}
            </View>
          </View>
        )}

        {/* Nutrition Comparison Table */}
        {(result.product1.nutrition || result.product2.nutrition) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Comparison</Text>
            <NutritionTable
              nutrition1={result.product1.nutrition}
              nutrition2={result.product2.nutrition}
              product1Name={result.product1.productName}
              product2Name={result.product2.productName}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 12 },
        ]}
      >
        <Pressable
          onPress={onCompareAgain}
          style={({ pressed }) => [
            styles.compareAgainBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Ionicons name="git-compare" size={20} color="#fff" />
          <Text style={styles.compareAgainText}>Compare Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topActions: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    gap: 8,
  },
  topIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.card,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  recommendationCard: {
    backgroundColor: Colors.light.tintLight,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 8,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendationTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.tint,
  },
  recommendationText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 12,
  },
  categoryGrid: {
    gap: 10,
  },
  chemicalList: {
    gap: 10,
  },
  flagHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  flagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  productBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  productBadgeText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.light.background,
  },
  compareAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
  },
  compareAgainText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
