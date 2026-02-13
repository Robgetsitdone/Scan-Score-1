import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { NutritionData } from "@/lib/types";

interface NutritionTableProps {
  nutrition1?: NutritionData;
  nutrition2?: NutritionData;
  product1Name: string;
  product2Name: string;
}

interface NutrientRowProps {
  label: string;
  value1: number | null | undefined;
  value2: number | null | undefined;
  unit: string;
  lowerIsBetter?: boolean;
  higherIsBetter?: boolean;
}

function NutrientRow({ label, value1, value2, unit, lowerIsBetter, higherIsBetter }: NutrientRowProps) {
  const v1 = value1 ?? null;
  const v2 = value2 ?? null;

  let winner: "1" | "2" | null = null;
  if (v1 !== null && v2 !== null) {
    if (lowerIsBetter) {
      winner = v1 < v2 ? "1" : v1 > v2 ? "2" : null;
    } else if (higherIsBetter) {
      winner = v1 > v2 ? "1" : v1 < v2 ? "2" : null;
    }
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueCell}>
        <Text style={[styles.value, winner === "1" && styles.valueWinner]}>
          {v1 !== null ? `${v1.toFixed(1)}${unit}` : "-"}
        </Text>
        {winner === "1" && (
          <Ionicons name="checkmark-circle" size={14} color={Colors.light.green} />
        )}
      </View>
      <View style={styles.valueCell}>
        <Text style={[styles.value, winner === "2" && styles.valueWinner]}>
          {v2 !== null ? `${v2.toFixed(1)}${unit}` : "-"}
        </Text>
        {winner === "2" && (
          <Ionicons name="checkmark-circle" size={14} color={Colors.light.green} />
        )}
      </View>
    </View>
  );
}

export default function NutritionTable({
  nutrition1,
  nutrition2,
  product1Name,
  product2Name,
}: NutritionTableProps) {
  return (
    <View style={styles.container}>
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={14} color={Colors.light.textTertiary} />
        <Text style={styles.disclaimerText}>Values per 100g - lower calories/sugar is typically better</Text>
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Nutrient</Text>
        <Text style={styles.headerValue} numberOfLines={1}>P1</Text>
        <Text style={styles.headerValue} numberOfLines={1}>P2</Text>
      </View>

      {/* Rows */}
      <NutrientRow
        label="Calories"
        value1={nutrition1?.calories}
        value2={nutrition2?.calories}
        unit=" kcal"
        lowerIsBetter
      />
      <NutrientRow
        label="Protein"
        value1={nutrition1?.protein}
        value2={nutrition2?.protein}
        unit="g"
        higherIsBetter
      />
      <NutrientRow
        label="Carbs"
        value1={nutrition1?.carbs}
        value2={nutrition2?.carbs}
        unit="g"
      />
      <NutrientRow
        label="Sugars"
        value1={nutrition1?.sugars}
        value2={nutrition2?.sugars}
        unit="g"
        lowerIsBetter
      />
      <NutrientRow
        label="Fat"
        value1={nutrition1?.fat}
        value2={nutrition2?.fat}
        unit="g"
        lowerIsBetter
      />
      <NutrientRow
        label="Sat. Fat"
        value1={nutrition1?.saturatedFat}
        value2={nutrition2?.saturatedFat}
        unit="g"
        lowerIsBetter
      />
      <NutrientRow
        label="Fiber"
        value1={nutrition1?.fiber}
        value2={nutrition2?.fiber}
        unit="g"
        higherIsBetter
      />
      <NutrientRow
        label="Sodium"
        value1={nutrition1?.sodium}
        value2={nutrition2?.sodium}
        unit="mg"
        lowerIsBetter
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  disclaimerText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  headerLabel: {
    flex: 1,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  headerValue: {
    width: 70,
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  label: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.text,
  },
  valueCell: {
    width: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  value: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  valueWinner: {
    color: Colors.light.green,
    fontFamily: "DMSans_600SemiBold",
  },
});
