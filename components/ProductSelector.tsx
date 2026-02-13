import React, { memo } from "react";
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

interface ProductSelectorProps {
  product: ScanResult;
  isSelected: boolean;
  onSelect: () => void;
}

function ProductSelector({ product, isSelected, onSelect }: ProductSelectorProps) {
  const scoreColor = getScoreColor(product.score);

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.containerSelected,
        { opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={styles.checkbox}>
        {isSelected ? (
          <View style={styles.checkboxSelected}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        ) : (
          <View style={styles.checkboxEmpty} />
        )}
      </View>

      <View style={[styles.scoreCircle, { backgroundColor: scoreColor + "18" }]}>
        <Text style={[styles.scoreNum, { color: scoreColor }]}>{product.score}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.productName}
        </Text>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand || product.category}
        </Text>
      </View>

      <View style={styles.flagCounts}>
        {product.flags.filter(f => f.level === "red").length > 0 && (
          <View style={[styles.flagBadge, { backgroundColor: Colors.light.redLight }]}>
            <Text style={[styles.flagBadgeText, { color: Colors.light.red }]}>
              {product.flags.filter(f => f.level === "red").length}
            </Text>
          </View>
        )}
        {product.flags.filter(f => f.level === "yellow").length > 0 && (
          <View style={[styles.flagBadge, { backgroundColor: Colors.light.yellowLight }]}>
            <Text style={[styles.flagBadgeText, { color: Colors.light.yellow }]}>
              {product.flags.filter(f => f.level === "yellow").length}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default memo(ProductSelector, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isSelected === nextProps.isSelected
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  containerSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tintLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  checkboxSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
  },
  brand: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  flagCounts: {
    flexDirection: "row",
    gap: 4,
  },
  flagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flagBadgeText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
  },
});
