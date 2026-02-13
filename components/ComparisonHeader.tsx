import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ScanResultWithNutrition, ComparisonWinner } from "@/lib/types";

function getScoreColor(score: number): string {
  if (score >= 90) return Colors.light.scoreExcellent;
  if (score >= 80) return Colors.light.scoreGood;
  if (score >= 70) return Colors.light.scoreCaution;
  if (score >= 60) return Colors.light.scoreLimit;
  if (score >= 50) return Colors.light.scoreTreat;
  return Colors.light.scoreAvoid;
}

interface ComparisonHeaderProps {
  product1: ScanResultWithNutrition;
  product2: ScanResultWithNutrition;
  winner: ComparisonWinner;
}

export default function ComparisonHeader({ product1, product2, winner }: ComparisonHeaderProps) {
  const score1Color = getScoreColor(product1.score);
  const score2Color = getScoreColor(product2.score);

  return (
    <View style={styles.container}>
      {/* Product 1 */}
      <View style={styles.productColumn}>
        {winner === "product1" && (
          <View style={styles.crownContainer}>
            <Ionicons name="trophy" size={24} color={Colors.light.scoreGood} />
          </View>
        )}
        <View style={[styles.scoreCircle, { backgroundColor: score1Color + "18" }]}>
          <Text style={[styles.scoreNum, { color: score1Color }]}>{product1.score}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {product1.productName}
        </Text>
        <Text style={styles.brandName} numberOfLines={1}>
          {product1.brand}
        </Text>
        <Text style={[styles.tierText, { color: score1Color }]}>{product1.tier}</Text>
      </View>

      {/* VS Divider */}
      <View style={styles.vsDivider}>
        <View style={styles.vsCircle}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.scoreDiff}>
          <Text style={styles.scoreDiffText}>
            {Math.abs(product1.score - product2.score)} pts
          </Text>
        </View>
      </View>

      {/* Product 2 */}
      <View style={styles.productColumn}>
        {winner === "product2" && (
          <View style={styles.crownContainer}>
            <Ionicons name="trophy" size={24} color={Colors.light.scoreGood} />
          </View>
        )}
        <View style={[styles.scoreCircle, { backgroundColor: score2Color + "18" }]}>
          <Text style={[styles.scoreNum, { color: score2Color }]}>{product2.score}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {product2.productName}
        </Text>
        <Text style={styles.brandName} numberOfLines={1}>
          {product2.brand}
        </Text>
        <Text style={[styles.tierText, { color: score2Color }]}>{product2.tier}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
  },
  productColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  crownContainer: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNum: {
    fontFamily: "DMSans_700Bold",
    fontSize: 28,
  },
  productName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "center",
  },
  brandName: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  tierText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    textAlign: "center",
  },
  vsDivider: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 28,
    gap: 8,
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  vsText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    color: Colors.light.textTertiary,
  },
  scoreDiff: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.light.tintLight,
    borderRadius: 8,
  },
  scoreDiffText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: Colors.light.tint,
  },
});
