import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ScanResult } from "@/lib/types";
import { toggleFavorite, setComparisonSelection } from "@/lib/storage";
import ScoreCircle from "./ScoreCircle";
import IngredientTag from "./IngredientTag";
import AlternativeCard from "./AlternativeCard";
import BreakdownBar from "./BreakdownBar";

interface ScanResultViewProps {
  result: ScanResult;
  onScanAgain: () => void;
}

export default function ScanResultView({
  result,
  onScanAgain,
}: ScanResultViewProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isFav, setIsFav] = useState(result.isFavorite ?? false);

  const handleCompare = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Pre-select this product for comparison
    await setComparisonSelection({ product1: result, product2: null });
    router.push("/compare");
  }, [result, router]);

  // Performance: Memoize flag filtering to avoid recalculation on every render
  const { redFlags, yellowFlags, greenFlags } = useMemo(() => {
    const red: typeof result.flags = [];
    const yellow: typeof result.flags = [];
    const green: typeof result.flags = [];
    for (const flag of result.flags) {
      if (flag.level === "red") red.push(flag);
      else if (flag.level === "yellow") yellow.push(flag);
      else if (flag.level === "green") green.push(flag);
    }
    return { redFlags: red, yellowFlags: yellow, greenFlags: green };
  }, [result.flags]);

  const handleToggleFavorite = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newState = await toggleFavorite(result.id);
    setIsFav(newState);
    result.isFavorite = newState;
  }, [result.id]);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const redList = redFlags.map((f) => f.term).join(", ");
    const yellowList = yellowFlags.map((f) => f.term).join(", ");
    const greenList = greenFlags.map((f) => f.term).join(", ");

    let message = `${result.productName}`;
    if (result.brand) message += ` by ${result.brand}`;
    message += `\nScore: ${result.score}/100 (${result.tier})`;
    if (redList) message += `\nAvoid: ${redList}`;
    if (yellowList) message += `\nCaution: ${yellowList}`;
    if (greenList) message += `\nPositive: ${greenList}`;
    message += `\n\nScanned with Score the Label`;

    try {
      await Share.share({ message });
    } catch (_) {}
  }, [result, redFlags, yellowFlags, greenFlags]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          { top: Platform.OS === "web" ? 67 + 8 : insets.top + 8 },
        ]}
      >
        <Pressable
          onPress={onScanAgain}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.topActions}>
          <Pressable
            onPress={handleToggleFavorite}
            hitSlop={12}
            style={styles.topIconBtn}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={24}
              color={isFav ? Colors.light.red : Colors.light.textTertiary}
            />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={12} style={styles.topIconBtn}>
            <Ionicons
              name="share-outline"
              size={22}
              color={Colors.light.textTertiary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{result.productName}</Text>
          <Text style={styles.productBrand}>
            {result.brand} {result.category ? `\u00B7 ${result.category}` : ""}
          </Text>
        </View>

        <ScoreCircle score={result.score} tier={result.tier} />

        <View style={styles.section}>
          <BreakdownBar breakdown={result.breakdown} score={result.score} />
        </View>

        {redFlags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={18} color={Colors.light.red} />
              <Text style={[styles.sectionTitle, { color: Colors.light.red }]}>
                Avoid ({redFlags.length})
              </Text>
            </View>
            <View style={styles.tagGrid}>
              {redFlags.map((flag, i) => (
                <IngredientTag key={`red-${i}`} flag={flag} />
              ))}
            </View>
          </View>
        )}

        {yellowFlags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={18} color={Colors.light.yellow} />
              <Text style={[styles.sectionTitle, { color: "#946200" }]}>
                Caution ({yellowFlags.length})
              </Text>
            </View>
            <View style={styles.tagGrid}>
              {yellowFlags.map((flag, i) => (
                <IngredientTag key={`yellow-${i}`} flag={flag} />
              ))}
            </View>
          </View>
        )}

        {greenFlags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.light.green}
              />
              <Text style={[styles.sectionTitle, { color: Colors.light.green }]}>
                Positive ({greenFlags.length})
              </Text>
            </View>
            <View style={styles.tagGrid}>
              {greenFlags.map((flag, i) => (
                <IngredientTag key={`green-${i}`} flag={flag} />
              ))}
            </View>
          </View>
        )}

        {result.ingredientsRaw ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Full Ingredients</Text>
            <View style={styles.ingredientsBox}>
              <Text style={styles.ingredientsText}>{result.ingredientsRaw}</Text>
            </View>
          </View>
        ) : null}

        {result.alternatives.length > 0 && (
          <View style={styles.altSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="swap-horizontal" size={18} color={Colors.light.tint} />
              <Text style={[styles.sectionTitle, { color: Colors.light.tint }]}>
                Better Alternatives
              </Text>
            </View>
            <FlatList
              data={result.alternatives}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => `alt-${i}`}
              contentContainerStyle={styles.altList}
              renderItem={({ item }) => <AlternativeCard alternative={item} />}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              scrollEnabled={result.alternatives.length > 0}
            />
          </View>
        )}

        <Text style={styles.disclaimer}>
          Not medical advice. Scores are estimates based on publicly available data. Regulatory status varies by region.
        </Text>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.bottomButtons}>
          <Pressable
            onPress={handleCompare}
            style={({ pressed }) => [
              styles.compareBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Ionicons name="git-compare-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.compareBtnText}>Compare</Text>
          </Pressable>
          <Pressable
            onPress={onScanAgain}
            style={({ pressed }) => [
              styles.scanAgainBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Ionicons name="scan" size={20} color="#fff" />
            <Text style={styles.scanAgainText}>Scan Another</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    position: "absolute" as const,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  topActions: {
    flexDirection: "row" as const,
    gap: 4,
  },
  topIconBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  productHeader: {
    alignItems: "center" as const,
    gap: 4,
  },
  productName: {
    fontFamily: "DMSans_700Bold",
    fontSize: 22,
    color: Colors.light.text,
    textAlign: "center" as const,
  },
  productBrand: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
  },
  tagGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  ingredientsBox: {
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 12,
  },
  ingredientsText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
  altSection: {
    gap: 12,
  },
  altList: {
    paddingHorizontal: 0,
  },
  bottomBar: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  bottomButtons: {
    flexDirection: "row" as const,
    gap: 10,
  },
  compareBtn: {
    backgroundColor: Colors.light.tintLight,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  compareBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.tint,
  },
  scanAgainBtn: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  scanAgainText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  disclaimer: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
    textAlign: "center" as const,
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
