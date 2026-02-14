import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  IngredientCategory,
  IngredientEducationEntry,
} from "@/lib/ingredient-education";

interface EducationCardProps {
  category: IngredientCategory;
  matchedIngredients: {
    ingredient: IngredientEducationEntry;
    flagTerm: string;
  }[];
}

export default function EducationCard({
  category,
  matchedIngredients,
}: EducationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setExpanded(true)}
        style={({ pressed }) => [
          styles.card,
          { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: category.color + "18" }]}>
          <Ionicons
            name={category.iconName as any}
            size={20}
            color={category.color}
          />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.concept} numberOfLines={2}>
            {category.concept}
          </Text>
          <View style={styles.matchedRow}>
            {matchedIngredients.slice(0, 3).map((m, i) => (
              <View
                key={i}
                style={[styles.matchPill, { backgroundColor: category.color + "15", borderColor: category.color + "30" }]}
              >
                <Text style={[styles.matchPillText, { color: category.color }]} numberOfLines={1}>
                  {m.ingredient.term}
                </Text>
              </View>
            ))}
            {matchedIngredients.length > 3 && (
              <Text style={[styles.moreText, { color: category.color }]}>
                +{matchedIngredients.length - 3}
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.light.textTertiary} />
      </Pressable>

      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setExpanded(false)}>
          <View
            style={styles.modal}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalTop, { backgroundColor: category.color + "12" }]}>
              <View style={[styles.modalIcon, { backgroundColor: category.color + "20" }]}>
                <Ionicons
                  name={category.iconName as any}
                  size={28}
                  color={category.color}
                />
              </View>
              <View style={styles.modalTitleArea}>
                <Text style={styles.modalTitle}>{category.name}</Text>
                <Text style={[styles.modalSubtitle, { color: category.color }]}>
                  {matchedIngredients.length} found in this product
                </Text>
              </View>
              <Pressable
                onPress={() => setExpanded(false)}
                hitSlop={12}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color={Colors.light.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.conceptFull}>{category.concept}</Text>
              <Text style={styles.detailText}>{category.detail}</Text>

              <View style={styles.divider} />

              <Text style={styles.foundLabel}>Found in this product:</Text>
              {matchedIngredients.map((m, i) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{m.ingredient.term}</Text>
                    <Text style={styles.ingredientExplain}>
                      {m.ingredient.shortExplain}
                    </Text>
                    {m.ingredient.regulatoryStatus ? (
                      <View style={styles.regRow}>
                        <Ionicons
                          name="information-circle-outline"
                          size={13}
                          color={Colors.light.textTertiary}
                        />
                        <Text style={styles.regText}>
                          {m.ingredient.regulatoryStatus}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}

              <Text style={styles.modalDisclaimer}>
                Educational content only. Not medical advice. Regulatory status varies by region.
              </Text>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
  },
  concept: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  matchedRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 5,
    marginTop: 4,
  },
  matchPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  matchPillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    maxWidth: 100,
  },
  moreText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    alignSelf: "center" as const,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden" as const,
  },
  modalTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    gap: 12,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalTitleArea: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    color: Colors.light.text,
  },
  modalSubtitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  conceptFull: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 21,
    marginBottom: 8,
  },
  detailText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: 16,
  },
  foundLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  ingredientRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  ingredientInfo: {
    flex: 1,
    gap: 2,
  },
  ingredientName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
  },
  ingredientExplain: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
  regRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 3,
  },
  regText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontStyle: "italic" as const,
  },
  modalDisclaimer: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
    textAlign: "center" as const,
    lineHeight: 16,
    marginTop: 12,
    marginBottom: 16,
    fontStyle: "italic" as const,
  },
});
