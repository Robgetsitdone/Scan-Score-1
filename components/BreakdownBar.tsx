import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { ScoreBreakdown } from "@/lib/types";

interface BreakdownBarProps {
  breakdown: ScoreBreakdown;
  score: number;
}

interface BarItemProps {
  label: string;
  value: number;
  max: number;
  color: string;
  isBonus?: boolean;
}

function BarItem({ label, value, max, color, isBonus }: BarItemProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={[barStyles.value, { color }]}>
          {isBonus ? "+" : "-"}
          {value}
        </Text>
      </View>
      <View style={barStyles.track}>
        <View
          style={[
            barStyles.fill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function BreakdownBar({ breakdown, score }: BreakdownBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Score Breakdown</Text>
        <Text style={styles.formula}>100 - penalties + bonuses = {score}</Text>
      </View>

      <BarItem
        label="Additives"
        value={breakdown.additivesPenalty}
        max={45}
        color={Colors.light.red}
      />
      <BarItem
        label="Nutrition"
        value={breakdown.nutritionPenalty}
        max={35}
        color={Colors.light.yellow}
      />
      <BarItem
        label="Processing"
        value={breakdown.processingPenalty}
        max={10}
        color={Colors.light.scoreTreat}
      />
      <BarItem
        label="Green Signals"
        value={breakdown.greenBonus}
        max={10}
        color={Colors.light.green}
        isBonus
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    gap: 4,
  },
  labelRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: Colors.light.text,
  },
  value: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
  },
  track: {
    height: 6,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    gap: 2,
  },
  title: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
  },
  formula: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textTertiary,
  },
});
