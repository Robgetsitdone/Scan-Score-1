import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ScanResult } from "@/lib/types";
import { getScanHistory, deleteScanResult, clearScanHistory } from "@/lib/storage";
import HistoryItem from "@/components/HistoryItem";
import ScanResultView from "@/components/ScanResultView";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);

  const loadHistory = useCallback(async () => {
    const data = await getScanHistory();
    setHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleDelete = useCallback(
    (item: ScanResult) => {
      Alert.alert("Delete Scan", `Remove ${item.productName} from history?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
            }
            await deleteScanResult(item.id);
            loadHistory();
          },
        },
      ]);
    },
    [loadHistory]
  );

  const handleClearAll = useCallback(() => {
    if (history.length === 0) return;
    Alert.alert(
      "Clear History",
      "This will remove all your scanned items. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearScanHistory();
            loadHistory();
          },
        },
      ]
    );
  }, [history.length, loadHistory]);

  if (selectedResult) {
    return (
      <View style={{ flex: 1 }}>
        <ScanResultView
          result={selectedResult}
          onScanAgain={() => setSelectedResult(null)}
        />
      </View>
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
        <Text style={styles.title}>History</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClearAll} hitSlop={12}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors.light.textTertiary}
            />
          </Pressable>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem
            result={item}
            onPress={() => setSelectedResult(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          history.length === 0 && styles.emptyList,
          { paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100 },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.tint}
          />
        }
        scrollEnabled={history.length > 0}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="time-outline"
                size={40}
                color={Colors.light.textTertiary}
              />
            </View>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>
              Your scanned products will appear here. Go scan a food label to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: "DMSans_700Bold",
    fontSize: 28,
    color: Colors.light.text,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center" as const,
  },
  empty: {
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.borderLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    color: Colors.light.text,
  },
  emptyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
