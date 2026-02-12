import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/lib/types";
import { getPreferences, savePreferences } from "@/lib/storage";

interface PrefToggleProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

function PrefToggle({
  label,
  description,
  value,
  onToggle,
  icon,
  iconColor,
}: PrefToggleProps) {
  return (
    <View style={toggleStyles.row}>
      <View style={[toggleStyles.iconBox, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={toggleStyles.textBox}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.desc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onToggle(val);
        }}
        trackColor={{ false: Colors.light.border, true: Colors.light.tint + "80" }}
        thumbColor={value ? Colors.light.tint : "#f4f4f4"}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  textBox: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: Colors.light.text,
  },
  desc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
});

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const saved = await getPreferences();
        setPrefs(saved);
      })();
    }, [])
  );

  const updatePref = useCallback(
    (key: keyof UserPreferences, value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        savePreferences(next);
        return next;
      });
    },
    []
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Preferences</Text>
        <Text style={styles.subtitle}>
          Toggle ingredients you want to avoid. Enabled items will be flagged as
          red when detected in a product.
        </Text>

        <View style={styles.card}>
          <PrefToggle
            label="Artificial Colors"
            description="Red 40, Yellow 5, Blue 1, etc."
            value={prefs.avoidArtificialColors}
            onToggle={(v) => updatePref("avoidArtificialColors", v)}
            icon="color-palette"
            iconColor={Colors.light.red}
          />
          <PrefToggle
            label="Artificial Sweeteners"
            description="Sucralose, aspartame, acesulfame K"
            value={prefs.avoidArtificialSweeteners}
            onToggle={(v) => updatePref("avoidArtificialSweeteners", v)}
            icon="cafe"
            iconColor={Colors.light.yellow}
          />
          <PrefToggle
            label="Nitrites / Nitrates"
            description="Common in processed meats"
            value={prefs.avoidNitrites}
            onToggle={(v) => updatePref("avoidNitrites", v)}
            icon="flame"
            iconColor={Colors.light.scoreTreat}
          />
          <PrefToggle
            label="Trans Fats"
            description="Partially hydrogenated oils"
            value={prefs.avoidTransFats}
            onToggle={(v) => updatePref("avoidTransFats", v)}
            icon="alert-circle"
            iconColor={Colors.light.red}
          />
          <PrefToggle
            label="BHA / BHT"
            description="Butylated hydroxyanisole/hydroxytoluene"
            value={prefs.avoidBHABHT}
            onToggle={(v) => updatePref("avoidBHABHT", v)}
            icon="flask"
            iconColor={Colors.light.scoreLimit}
          />
          <PrefToggle
            label="High Fructose Corn Syrup"
            description="Common processed sweetener"
            value={prefs.avoidHighFructoseCornSyrup}
            onToggle={(v) => updatePref("avoidHighFructoseCornSyrup", v)}
            icon="nutrition"
            iconColor={Colors.light.yellow}
          />
          <PrefToggle
            label="MSG"
            description="Monosodium glutamate"
            value={prefs.avoidMSG}
            onToggle={(v) => updatePref("avoidMSG", v)}
            icon="beaker"
            iconColor={Colors.light.textSecondary}
          />
          <View style={{ borderBottomWidth: 0 }}>
            <PrefToggle
              label="Carrageenan"
              description="Thickener linked to digestive concerns"
              value={prefs.avoidCarrageenan}
              onToggle={(v) => updatePref("avoidCarrageenan", v)}
              icon="water"
              iconColor={Colors.light.scoreCaution}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle"
            size={18}
            color={Colors.light.tint}
          />
          <Text style={styles.infoText}>
            These preferences influence how ingredients are flagged during
            analysis. Enabled items are escalated to red when detected.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
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
    lineHeight: 20,
    marginTop: -4,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoCard: {
    backgroundColor: Colors.light.tintLight,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row" as const,
    gap: 10,
    alignItems: "flex-start" as const,
  },
  infoText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.tint,
    lineHeight: 18,
    flex: 1,
  },
});
