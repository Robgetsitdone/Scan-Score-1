import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ScanResult, ComparisonResult, isCompareError } from "@/lib/types";
import { getScanHistory, getComparisonSelection, clearComparisonSelection } from "@/lib/storage";
import { api } from "@/lib/api";
import ComparisonView from "@/components/ComparisonView";
import ProductSelector from "@/components/ProductSelector";

type CompareState = "select" | "loading" | "result";

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<CompareState>("select");
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ScanResult[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [historyData, selection] = await Promise.all([
      getScanHistory(),
      getComparisonSelection(),
    ]);
    setHistory(historyData);

    // Pre-select products from storage if any
    if (selection.product1 || selection.product2) {
      const selected: ScanResult[] = [];
      if (selection.product1) {
        selected.push(selection.product1);
      }
      if (selection.product2) {
        selected.push(selection.product2);
      }
      if (selected.length > 0) {
        setSelectedProducts(selected);
        // Clear the selection after loading
        await clearComparisonSelection();
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSelectProduct = useCallback((product: ScanResult) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        // Replace the oldest selection
        return [prev[1], product];
      }
      return [...prev, product];
    });
  }, []);

  const handleCompare = useCallback(async () => {
    if (selectedProducts.length !== 2) return;

    setState("loading");
    setError(null);

    try {
      const result = await api.compareProducts(selectedProducts[0], selectedProducts[1]);

      if (isCompareError(result)) {
        setError(result.message);
        setState("select");
        return;
      }

      setComparisonResult(result);
      setState("result");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setError(err.message || "Failed to compare products");
      setState("select");
    }
  }, [selectedProducts]);

  const handleReset = useCallback(() => {
    setState("select");
    setSelectedProducts([]);
    setComparisonResult(null);
    setError(null);
  }, []);

  const isProductSelected = useCallback(
    (product: ScanResult) => selectedProducts.some((p) => p.id === product.id),
    [selectedProducts]
  );

  if (state === "result" && comparisonResult) {
    return (
      <ComparisonView
        result={comparisonResult}
        onCompareAgain={handleReset}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16 },
        ]}
      >
        <Text style={styles.title}>Compare</Text>
        <Text style={styles.subtitle}>
          Select 2 products to compare side-by-side
        </Text>
      </View>

      {/* Selected Products Preview */}
      <View style={styles.selectionPreview}>
        <View style={styles.selectionSlot}>
          {selectedProducts[0] ? (
            <Pressable
              onPress={() => handleSelectProduct(selectedProducts[0])}
              style={styles.selectedProduct}
            >
              <Text style={styles.selectedProductName} numberOfLines={1}>
                {selectedProducts[0].productName}
              </Text>
              <View style={styles.selectedProductScore}>
                <Text style={styles.selectedProductScoreText}>
                  {selectedProducts[0].score}
                </Text>
              </View>
              <Ionicons name="close-circle" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Product 1</Text>
            </View>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.selectionSlot}>
          {selectedProducts[1] ? (
            <Pressable
              onPress={() => handleSelectProduct(selectedProducts[1])}
              style={styles.selectedProduct}
            >
              <Text style={styles.selectedProductName} numberOfLines={1}>
                {selectedProducts[1].productName}
              </Text>
              <View style={styles.selectedProductScore}>
                <Text style={styles.selectedProductScoreText}>
                  {selectedProducts[1].score}
                </Text>
              </View>
              <Ionicons name="close-circle" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>Product 2</Text>
            </View>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.light.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {state === "loading" ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Comparing products...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Select from History</Text>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductSelector
                product={item}
                isSelected={isProductSelected(item)}
                onSelect={() => handleSelectProduct(item)}
              />
            )}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: Platform.OS === "web" ? 34 + 160 : insets.bottom + 160 },
            ]}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Ionicons name="scan-outline" size={40} color={Colors.light.textTertiary} />
                <Text style={styles.emptyText}>
                  No products in history yet. Scan some products first!
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* Compare Button */}
      {selectedProducts.length === 2 && state === "select" && (
        <View
          style={[
            styles.compareButtonContainer,
            { paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80 },
          ]}
        >
          <Pressable
            onPress={handleCompare}
            style={({ pressed }) => [
              styles.compareButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <Ionicons name="git-compare" size={20} color="#fff" />
            <Text style={styles.compareButtonText}>Compare Products</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontFamily: "DMSans_700Bold",
    fontSize: 28,
    color: Colors.light.text,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  selectionPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  selectionSlot: {
    flex: 1,
  },
  emptySlot: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  emptySlotText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: Colors.light.textTertiary,
  },
  selectedProduct: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.light.tintLight,
    borderRadius: 10,
    gap: 8,
  },
  selectedProductName: {
    flex: 1,
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: Colors.light.text,
  },
  selectedProductScore: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedProductScoreText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    color: "#fff",
  },
  vsContainer: {
    width: 40,
    alignItems: "center",
  },
  vsText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    color: Colors.light.textTertiary,
  },
  sectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyList: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.light.redLight,
    borderRadius: 10,
  },
  errorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.red,
    flex: 1,
  },
  compareButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.light.background,
  },
  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
  },
  compareButtonText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});
