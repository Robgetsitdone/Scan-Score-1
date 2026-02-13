import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ChemicalExposureInfo } from "@/lib/types";

interface ChemicalExposureCardProps {
  exposure: ChemicalExposureInfo;
  product1Name: string;
  product2Name: string;
}

function getCategoryIcon(category: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (category) {
    case "preservative":
      return "flask";
    case "artificial_coloring":
      return "palette";
    case "chemical_additive":
      return "atom";
    default:
      return "alert-circle";
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "preservative":
      return "Preservative";
    case "artificial_coloring":
      return "Artificial Coloring";
    case "chemical_additive":
      return "Chemical Additive";
    default:
      return "Other";
  }
}

export default function ChemicalExposureCard({
  exposure,
  product1Name,
  product2Name,
}: ChemicalExposureCardProps) {
  const [expanded, setExpanded] = useState(false);

  const foundInText =
    exposure.foundIn === "both"
      ? "Found in both products"
      : exposure.foundIn === "product1"
        ? `Found in ${product1Name}`
        : `Found in ${product2Name}`;

  const foundInColor =
    exposure.foundIn === "both" ? Colors.light.red : Colors.light.yellow;

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: foundInColor + "18" }]}>
          <MaterialCommunityIcons
            name={getCategoryIcon(exposure.category)}
            size={18}
            color={foundInColor}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.term}>{exposure.term}</Text>
          <View style={styles.badges}>
            <View style={[styles.categoryBadge, { backgroundColor: Colors.light.borderLight }]}>
              <Text style={styles.categoryText}>{getCategoryLabel(exposure.category)}</Text>
            </View>
            <View style={[styles.foundInBadge, { backgroundColor: foundInColor + "18" }]}>
              <Text style={[styles.foundInText, { color: foundInColor }]}>
                {exposure.foundIn === "both" ? "Both" : exposure.foundIn === "product1" ? "P1" : "P2"}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={Colors.light.textTertiary}
        />
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.foundInLabel}>{foundInText}</Text>
          </View>

          <Text style={styles.implication}>{exposure.healthImplication}</Text>

          {exposure.foundIn === "both" && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={14} color={Colors.light.red} />
              <Text style={styles.warningText}>
                Exposure from multiple products may increase cumulative risk
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    gap: 6,
  },
  term: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  foundInBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  foundInText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
  },
  expandedContent: {
    marginTop: 12,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  foundInLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  implication: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 19,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    backgroundColor: Colors.light.redLight,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: Colors.light.red,
    lineHeight: 17,
  },
});
