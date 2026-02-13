import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { ScanResult, WeeklyStats } from "@/lib/types";
import { getScanHistory, deleteScanResult, clearScanHistory, getWeeklyStats } from "@/lib/storage";
import HistoryItem from "@/components/HistoryItem";
import ScanResultView from "@/components/ScanResultView";

function getScoreColor(score: number): string {
  if (score >= 90) return Colors.light.scoreExcellent;
  if (score >= 80) return Colors.light.scoreGood;
  if (score >= 70) return Colors.light.scoreCaution;
  if (score >= 60) return Colors.light.scoreLimit;
  if (score >= 50) return Colors.light.scoreTreat;
  return Colors.light.scoreAvoid;
}

// Performance: Memoized separator component to avoid re-creation on every render
const ItemSeparator = memo(() => <View style={{ height: 8 }} />);
ItemSeparator.displayName = "ItemSeparator";

// Performance: Memoized WeeklyTracker to prevent unnecessary re-renders
const WeeklyTracker = memo(function WeeklyTracker({ stats }: { stats: WeeklyStats[] }) {
  if (stats.length === 0) return null;

  const current = stats[0];
  const previous = stats.length > 1 ? stats[1] : null;
  const trend = previous ? current.avgScore - previous.avgScore : 0;
  const maxBarScore = 100;

  return (
    <View style={trackerStyles.container}>
      <View style={trackerStyles.headerRow}>
        <View style={trackerStyles.headerLeft}>
          <Ionicons name="analytics-outline" size={18} color={Colors.light.tint} />
          <Text style={trackerStyles.headerTitle}>Weekly Average</Text>
        </View>
        {trend !== 0 && (
          <View style={[trackerStyles.trendBadge, { backgroundColor: trend > 0 ? Colors.light.greenLight : Colors.light.redLight }]}>
            <Ionicons
              name={trend > 0 ? "arrow-up" : "arrow-down"}
              size={12}
              color={trend > 0 ? Colors.light.green : Colors.light.red}
            />
            <Text style={[trackerStyles.trendText, { color: trend > 0 ? Colors.light.green : Colors.light.red }]}>
              {Math.abs(trend)} pts
            </Text>
          </View>
        )}
      </View>

      <View style={trackerStyles.currentRow}>
        <Text style={[trackerStyles.bigScore, { color: getScoreColor(current.avgScore) }]}>
          {current.avgScore}
        </Text>
        <View style={trackerStyles.currentMeta}>
          <Text style={trackerStyles.metaLabel}>This week</Text>
          <Text style={trackerStyles.metaValue}>
            {current.scanCount} scan{current.scanCount !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={trackerStyles.barsContainer}>
        {stats.slice(0, 6).reverse().map((week, i) => {
          const height = Math.max(8, (week.avgScore / maxBarScore) * 60);
          const color = getScoreColor(week.avgScore);
          const isLast = i === stats.slice(0, 6).reverse().length - 1;
          return (
            <View key={week.startDate} style={trackerStyles.barCol}>
              <View
                style={[
                  trackerStyles.bar,
                  {
                    height,
                    backgroundColor: isLast ? color : color + "40",
                    borderWidth: isLast ? 2 : 0,
                    borderColor: color,
                  },
                ]}
              />
              <Text style={trackerStyles.barLabel}>
                {new Date(week.startDate).toLocaleDateString("en-US", { month: "narrow", day: "numeric" })}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

type FilterMode = "all" | "favorites";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  const filteredHistory = useMemo(() => {
    if (filter === "favorites") return history.filter((h) => h.isFavorite);
    return history;
  }, [history, filter]);

  const weeklyStats = useMemo(() => getWeeklyStats(history), [history]);

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
          onScanAgain={() => {
            setSelectedResult(null);
            loadHistory();
          }}
        />
      </View>
    );
  }

  const favCount = history.filter((h) => h.isFavorite).length;

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

      {history.length > 0 && (
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter("all")}
            style={[
              styles.filterChip,
              filter === "all" && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All ({history.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("favorites")}
            style={[
              styles.filterChip,
              filter === "favorites" && styles.filterChipActive,
            ]}
          >
            <Ionicons
              name="heart"
              size={13}
              color={filter === "favorites" ? "#fff" : Colors.light.red}
            />
            <Text
              style={[
                styles.filterText,
                filter === "favorites" && styles.filterTextActive,
              ]}
            >
              Favorites ({favCount})
            </Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={filteredHistory}
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
          filteredHistory.length === 0 && styles.emptyList,
          { paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100 },
        ]}
        // Performance: Use memoized separator component
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.tint}
          />
        }
        scrollEnabled={filteredHistory.length > 0}
        // Performance: FlatList optimizations
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        initialNumToRender={10}
        ListHeaderComponent={
          filter === "all" && weeklyStats.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <WeeklyTracker stats={weeklyStats} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={filter === "favorites" ? "heart-outline" : "time-outline"}
                size={40}
                color={Colors.light.textTertiary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === "favorites" ? "No favorites yet" : "No scans yet"}
            </Text>
            <Text style={styles.emptyText}>
              {filter === "favorites"
                ? "Tap the heart icon on any scan result to save it here."
                : "Your scanned products will appear here. Go scan a food label to get started!"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const trackerStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  headerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  headerTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
  },
  trendBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trendText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
  },
  currentRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  bigScore: {
    fontFamily: "DMSans_700Bold",
    fontSize: 40,
  },
  currentMeta: {
    gap: 2,
  },
  metaLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.textTertiary,
  },
  metaValue: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  barsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "flex-end" as const,
    height: 80,
    paddingTop: 4,
  },
  barCol: {
    alignItems: "center" as const,
    gap: 4,
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 6,
    minHeight: 8,
  },
  barLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
});

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
  filterRow: {
    flexDirection: "row" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: "#fff",
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
