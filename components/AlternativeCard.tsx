import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Alternative } from "@/lib/types";

function getScoreColor(score: number): string {
  if (score >= 90) return Colors.light.scoreExcellent;
  if (score >= 80) return Colors.light.scoreGood;
  if (score >= 70) return Colors.light.scoreCaution;
  if (score >= 60) return Colors.light.scoreLimit;
  if (score >= 50) return Colors.light.scoreTreat;
  return Colors.light.scoreAvoid;
}

interface AlternativeCardProps {
  alternative: Alternative;
}

export default function AlternativeCard({ alternative }: AlternativeCardProps) {
  const scoreColor = getScoreColor(alternative.score);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.name} numberOfLines={2}>
            {alternative.name}
          </Text>
          <Text style={styles.brand}>{alternative.brand}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + "18" }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {alternative.score}
          </Text>
          <Text style={[styles.tierText, { color: scoreColor }]}>
            {alternative.tier}
          </Text>
        </View>
      </View>

      <Text style={styles.whyBetter}>{alternative.whyBetter}</Text>

      <View style={styles.differences}>
        {alternative.keyDifferences.map((diff, idx) => (
          <View key={idx} style={styles.diffRow}>
            <Ionicons name="checkmark" size={14} color={Colors.light.green} />
            <Text style={styles.diffText}>{diff}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    gap: 10,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 20,
  },
  brand: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 50,
  },
  scoreText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
  },
  tierText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    marginTop: -1,
  },
  whyBetter: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  differences: {
    gap: 4,
  },
  diffRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  diffText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.text,
    flex: 1,
  },
});
