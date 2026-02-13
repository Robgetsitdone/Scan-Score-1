import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { CategoryComparison } from "@/lib/types";

interface CategoryComparisonCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  comparison: CategoryComparison;
  product1Name: string;
  product2Name: string;
}

export default function CategoryComparisonCard({
  title,
  icon,
  comparison,
  product1Name,
  product2Name,
}: CategoryComparisonCardProps) {
  const { winner, product1Value, product2Value } = comparison;

  // For penalties, lower is better
  const maxValue = Math.max(product1Value, product2Value, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color={Colors.light.tint} />
        <Text style={styles.title}>{title}</Text>
        {winner !== "tie" && (
          <View style={styles.winnerBadge}>
            <Ionicons name="checkmark" size={12} color={Colors.light.green} />
            <Text style={styles.winnerText}>
              {winner === "product1" ? "P1" : "P2"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.barsContainer}>
        {/* Product 1 Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>1</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(product1Value / maxValue) * 100}%`,
                  backgroundColor: winner === "product1" ? Colors.light.green : Colors.light.red,
                },
              ]}
            />
          </View>
          <Text style={styles.barValue}>{product1Value}</Text>
        </View>

        {/* Product 2 Bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>2</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(product2Value / maxValue) * 100}%`,
                  backgroundColor: winner === "product2" ? Colors.light.green : Colors.light.red,
                },
              ]}
            />
          </View>
          <Text style={styles.barValue}>{product2Value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  winnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  winnerText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: Colors.light.green,
  },
  barsContainer: {
    gap: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: Colors.light.textSecondary,
    width: 16,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barValue: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: Colors.light.text,
    width: 24,
    textAlign: "right",
  },
});
