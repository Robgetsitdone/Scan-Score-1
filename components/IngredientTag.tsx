import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { HazardLevel, IngredientFlag } from "@/lib/types";

function getLevelConfig(level: HazardLevel) {
  switch (level) {
    case "red":
      return {
        bg: Colors.light.redBg,
        border: Colors.light.red,
        text: Colors.light.red,
        icon: "alert-circle" as const,
        label: "Avoid",
      };
    case "yellow":
      return {
        bg: Colors.light.yellowBg,
        border: Colors.light.yellow,
        text: "#946200",
        icon: "warning" as const,
        label: "Caution",
      };
    case "green":
      return {
        bg: Colors.light.greenBg,
        border: Colors.light.green,
        text: Colors.light.green,
        icon: "checkmark-circle" as const,
        label: "Positive",
      };
    default:
      return {
        bg: Colors.light.borderLight,
        border: Colors.light.border,
        text: Colors.light.textSecondary,
        icon: "ellipse" as const,
        label: "Neutral",
      };
  }
}

interface IngredientTagProps {
  flag: IngredientFlag;
}

export default function IngredientTag({ flag }: IngredientTagProps) {
  const [showDetail, setShowDetail] = useState(false);
  const config = getLevelConfig(flag.level);

  return (
    <>
      <Pressable
        onPress={() => setShowDetail(true)}
        style={({ pressed }) => [
          styles.tag,
          { backgroundColor: config.bg, borderColor: config.border, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name={config.icon} size={14} color={config.text} />
        <Text style={[styles.tagText, { color: config.text }]} numberOfLines={1}>
          {flag.term}
        </Text>
      </Pressable>

      <Modal
        visible={showDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetail(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDetail(false)}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={24} color={config.text} />
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: config.text }]}>
                  {flag.term}
                </Text>
                <Text style={[styles.modalLevel, { color: config.text }]}>
                  {config.label}
                </Text>
              </View>
              <Pressable onPress={() => setShowDetail(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={Colors.light.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalExplain}>{flag.explain}</Text>
              <Text style={styles.disclaimer}>
                This information is for educational purposes only and is not medical advice. Regulatory status may vary by region.
              </Text>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    maxWidth: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden" as const,
  },
  modalHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    gap: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 17,
  },
  modalLevel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 1,
  },
  modalBody: {
    padding: 16,
    maxHeight: 250,
  },
  modalExplain: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  disclaimer: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 16,
    lineHeight: 17,
    fontStyle: "italic" as const,
  },
});
