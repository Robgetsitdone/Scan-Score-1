import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { ScanResult } from "@/lib/types";
import { saveScanResult } from "@/lib/storage";
import { getPreferences } from "@/lib/storage";
import { apiRequest } from "@/lib/query-client";
import ScanResultView from "@/components/ScanResultView";

type ScanState = "idle" | "loading" | "result" | "error";

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pulseAnim = useSharedValue(1);

  const startPulse = useCallback(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const stopPulse = useCallback(() => {
    pulseAnim.value = withTiming(1, { duration: 200 });
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const analyzeImage = useCallback(async (base64: string) => {
    setScanState("loading");
    startPulse();
    try {
      const prefs = await getPreferences();
      const response = await apiRequest("POST", "/api/analyze", {
        imageBase64: base64,
        preferences: prefs,
      });

      const data = await response.json();

      if (data.error === "not_food") {
        setErrorMsg(data.message || "This doesn't appear to be a food label.");
        setScanState("error");
        stopPulse();
        return;
      }

      if (data.error) {
        setErrorMsg(data.message || "Analysis failed. Please try again.");
        setScanState("error");
        stopPulse();
        return;
      }

      const scanResult: ScanResult = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productName: data.productName || "Unknown Product",
        brand: data.brand || "",
        category: data.category || "",
        score: data.score || 50,
        tier: data.tier || "Treat / very infrequent",
        breakdown: data.breakdown || {
          additivesPenalty: 0,
          nutritionPenalty: 0,
          processingPenalty: 0,
          greenBonus: 0,
        },
        flags: data.flags || [],
        alternatives: data.alternatives || [],
        ingredientsRaw: data.ingredientsRaw || "",
        scanDate: new Date().toISOString(),
      };

      await saveScanResult(scanResult);
      setResult(scanResult);
      setScanState("result");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setScanState("error");
    }
    stopPulse();
  }, []);

  const takePhoto = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert(
        "Camera Access Needed",
        "Please allow camera access to scan food labels.",
        [{ text: "OK" }]
      );
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]?.uri) {
      const manipulated = await ImageManipulator.manipulateAsync(
        pickerResult.assets[0].uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      if (manipulated.base64) {
        analyzeImage(manipulated.base64);
      }
    }
  }, [analyzeImage]);

  const pickFromGallery = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]?.uri) {
      const manipulated = await ImageManipulator.manipulateAsync(
        pickerResult.assets[0].uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      if (manipulated.base64) {
        analyzeImage(manipulated.base64);
      }
    }
  }, [analyzeImage]);

  const resetScan = useCallback(() => {
    setScanState("idle");
    setResult(null);
    setErrorMsg("");
  }, []);

  if (scanState === "result" && result) {
    return <ScanResultView result={result} onScanAgain={resetScan} />;
  }

  return (
    <View style={[styles.container]}>
      <View
        style={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 + 24 : insets.top + 24,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
      >
        {scanState === "idle" && (
          <>
            <View style={styles.hero}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="barcode-scan"
                  size={36}
                  color={Colors.light.tint}
                />
              </View>
              <Text style={styles.heroTitle}>Scan a Food Label</Text>
              <Text style={styles.heroSubtitle}>
                Take a photo of any ingredient list or nutrition panel. We'll flag
                what matters and score it instantly.
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={takePhoto}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Ionicons name="camera" size={22} color="#fff" />
                <Text style={styles.primaryBtnText}>Take Photo</Text>
              </Pressable>

              <Pressable
                onPress={pickFromGallery}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Ionicons name="images" size={20} color={Colors.light.tint} />
                <Text style={styles.secondaryBtnText}>Choose from Gallery</Text>
              </Pressable>
            </View>

            <View style={styles.tips}>
              <View style={styles.tipRow}>
                <Ionicons
                  name="bulb-outline"
                  size={16}
                  color={Colors.light.textTertiary}
                />
                <Text style={styles.tipText}>
                  Make sure the ingredient list is clearly readable
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons
                  name="flashlight-outline"
                  size={16}
                  color={Colors.light.textTertiary}
                />
                <Text style={styles.tipText}>
                  Avoid glare and ensure good lighting
                </Text>
              </View>
            </View>
          </>
        )}

        {scanState === "loading" && (
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingCircle, pulseStyle]}>
              <MaterialCommunityIcons
                name="food-apple"
                size={40}
                color={Colors.light.tint}
              />
            </Animated.View>
            <Text style={styles.loadingTitle}>Analyzing your label...</Text>
            <Text style={styles.loadingSubtitle}>
              Reading ingredients, checking additives, calculating score
            </Text>
            <ActivityIndicator
              size="small"
              color={Colors.light.tint}
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {scanState === "error" && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}>
              <Ionicons name="alert-circle" size={40} color={Colors.light.red} />
            </View>
            <Text style={styles.errorTitle}>Couldn't analyze</Text>
            <Text style={styles.errorMessage}>{errorMsg}</Text>
            <Pressable
              onPress={resetScan}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  marginTop: 12,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center" as const,
  },
  hero: {
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tintLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 26,
    color: Colors.light.text,
    textAlign: "center" as const,
  },
  heroSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  primaryBtnText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 17,
    color: "#fff",
  },
  secondaryBtn: {
    backgroundColor: Colors.light.card,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: Colors.light.tint,
  },
  tips: {
    gap: 8,
    paddingHorizontal: 8,
  },
  tipRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  tipText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: Colors.light.textTertiary,
  },
  loadingContainer: {
    alignItems: "center" as const,
    gap: 12,
  },
  loadingCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.tintLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  loadingTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    color: Colors.light.text,
  },
  loadingSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  errorContainer: {
    alignItems: "center" as const,
    gap: 8,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.redLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  errorTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    color: Colors.light.text,
  },
  errorMessage: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
