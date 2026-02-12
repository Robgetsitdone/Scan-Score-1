import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ScanResult } from "@/lib/types";

function getScoreColor(score: number): string {
  if (score >= 90) return Colors.light.scoreExcellent;
  if (score >= 80) return Colors.light.scoreGood;
  if (score >= 70) return Colors.light.scoreCaution;
  if (score >= 60) return Colors.light.scoreLimit;
  if (score >= 50) return Colors.light.scoreTreat;
  return Colors.light.scoreAvoid;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface HistoryItemProps {
  result: ScanResult;
  onPress: () => void;
  onDelete: () => void;
}

export default function HistoryItem({ result, onPress, onDelete }: HistoryItemProps) {
  const scoreColor = getScoreColor(result.score);
  const redCount = result.flags.filter((f) => f.level === "red").length;
  const yellowCount = result.flags.filter((f) => f.level === "yellow").length;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
    >
      <View style={[styles.scoreCircle, { backgroundColor: scoreColor + "18" }]}>
        <Text style={[styles.scoreNum, { color: scoreColor }]}>{result.score}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {result.productName}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {result.brand}
          {redCount > 0 && ` \u00B7 ${redCount} red flag${redCount > 1 ? "s" : ""}`}
          {yellowCount > 0 && ` \u00B7 ${yellowCount} caution`}
        </Text>
        <Text style={styles.date}>{formatDate(result.scanDate)}</Text>
      </View>

      <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={Colors.light.textTertiary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scoreNum: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
  },
  detail: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  date: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  deleteBtn: {
    padding: 6,
  },
});
