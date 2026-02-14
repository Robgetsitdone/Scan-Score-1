import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  ScrollView,
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
  FadeIn,
} from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import Colors from "@/constants/colors";
import { ScanResult, isAnalyzeError } from "@/lib/types";
import { saveScanResult, getPreferences } from "@/lib/storage";
import { api } from "@/lib/api";
import ScanResultView from "@/components/ScanResultView";

type ScanState = "idle" | "loading" | "result" | "error" | "barcode";

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pulseAnim = useSharedValue(1);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const barcodeScannedRef = useRef(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (scanState !== "loading") {
      setLoadingStep(0);
      return;
    }
    const steps = [1500, 3500, 6000];
    const timers = steps.map((ms, i) =>
      setTimeout(() => setLoadingStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [scanState]);

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
      const data = await api.analyzeImage(base64, prefs);

      if (isAnalyzeError(data)) {
        setErrorMsg(data.message || "Analysis failed. Please try again.");
        setScanState("error");
        stopPulse();
        return;
      }

      const scanResult: ScanResult = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
    barcodeScannedRef.current = false;
  }, []);

  const analyzeBarcode = useCallback(async (barcode: string) => {
    setScanState("loading");
    startPulse();
    try {
      const prefs = await getPreferences();
      const data = await api.analyzeBarcode(barcode, prefs);

      if (isAnalyzeError(data)) {
        setErrorMsg(data.message || "Analysis failed. Please try again.");
        setScanState("error");
        stopPulse();
        return;
      }

      const scanResult: ScanResult = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

  const openBarcodeScanner = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Not Available",
        "Barcode scanning requires a mobile device. Please use the Expo Go app on your phone.",
        [{ text: "OK" }]
      );
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permResult = await requestCameraPermission();
    if (!permResult.granted) {
      Alert.alert(
        "Camera Access Needed",
        "Please allow camera access to scan barcodes.",
        [{ text: "OK" }]
      );
      return;
    }

    barcodeScannedRef.current = false;
    setScanState("barcode");
  }, [requestCameraPermission]);

  const handleBarcodeScanned = useCallback(
    (result: { data: string }) => {
      if (barcodeScannedRef.current) return;
      barcodeScannedRef.current = true;
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      analyzeBarcode(result.data);
    },
    [analyzeBarcode]
  );

  if (scanState === "barcode") {
    return (
      <View style={styles.barcodeContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
        />
        <View style={styles.barcodeOverlay}>
          <View style={styles.barcodeOverlayTop} />
          <View style={styles.barcodeOverlayMiddle}>
            <View style={styles.barcodeOverlaySide} />
            <View style={styles.barcodeScanGuide} />
            <View style={styles.barcodeOverlaySide} />
          </View>
          <View style={styles.barcodeOverlayBottom}>
            <Text style={styles.barcodeScanText}>
              Point at a barcode to scan
            </Text>
          </View>
        </View>
        <Pressable
          onPress={resetScan}
          style={[
            styles.barcodeCloseBtn,
            { top: Platform.OS === "web" ? 67 + 16 : insets.top + 16 },
          ]}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    );
  }

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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.idleScroll}
          >
            <View style={styles.hero}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logoImage}
              />
              <Text style={styles.heroTitle}>Score the Label</Text>
              <Text style={styles.heroTagline}>
                Know what's really in your food.
              </Text>
            </View>

            <View style={styles.valueProps}>
              <View style={styles.valuePropRow}>
                <View style={[styles.valuePropIcon, { backgroundColor: Colors.light.redLight }]}>
                  <Ionicons name="warning" size={16} color={Colors.light.red} />
                </View>
                <View style={styles.valuePropText}>
                  <Text style={styles.valuePropTitle}>Detect hidden chemicals</Text>
                  <Text style={styles.valuePropDesc}>
                    Red-flag harmful additives like Red 40, BHA, and titanium dioxide before they reach your plate.
                  </Text>
                </View>
              </View>
              <View style={styles.valuePropRow}>
                <View style={[styles.valuePropIcon, { backgroundColor: Colors.light.yellowLight }]}>
                  <Ionicons name="flask" size={16} color={Colors.light.yellow} />
                </View>
                <View style={styles.valuePropText}>
                  <Text style={styles.valuePropTitle}>Expose ultra-processed ingredients</Text>
                  <Text style={styles.valuePropDesc}>
                    Spot artificial sweeteners, high fructose corn syrup, and preservatives that don't belong in real food.
                  </Text>
                </View>
              </View>
              <View style={styles.valuePropRow}>
                <View style={[styles.valuePropIcon, { backgroundColor: Colors.light.greenLight }]}>
                  <Ionicons name="leaf" size={16} color={Colors.light.green} />
                </View>
                <View style={styles.valuePropText}>
                  <Text style={styles.valuePropTitle}>Find cleaner alternatives</Text>
                  <Text style={styles.valuePropDesc}>
                    Get instant suggestions for healthier swaps with fewer chemicals and better scores.
                  </Text>
                </View>
              </View>
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

              <View style={styles.actionRow}>
                <Pressable
                  onPress={pickFromGallery}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    styles.actionHalf,
                    {
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Ionicons name="images" size={20} color={Colors.light.tint} />
                  <Text style={styles.secondaryBtnText}>Gallery</Text>
                </Pressable>

                <Pressable
                  onPress={openBarcodeScanner}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    styles.actionHalf,
                    {
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="barcode-scan" size={20} color={Colors.light.tint} />
                  <Text style={styles.secondaryBtnText}>Barcode</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.tips}>
              <View style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={16} color={Colors.light.textTertiary} />
                <Text style={styles.tipText}>
                  Make sure the ingredient list is clearly readable
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="flashlight-outline" size={16} color={Colors.light.textTertiary} />
                <Text style={styles.tipText}>
                  Avoid glare and ensure good lighting
                </Text>
              </View>
            </View>
          </ScrollView>
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

            <View style={styles.loadingSteps}>
              {[
                { icon: "eye-outline" as const, text: "Reading ingredients" },
                { icon: "flask-outline" as const, text: "Checking for chemicals & additives" },
                { icon: "calculator-outline" as const, text: "Calculating health score" },
              ].map((step, i) => (
                <Animated.View
                  key={step.text}
                  entering={FadeIn.delay(i * 1500).duration(400)}
                  style={[
                    styles.stepRow,
                    {
                      opacity: loadingStep >= i ? 1 : 0.3,
                    },
                  ]}
                >
                  <Ionicons
                    name={loadingStep > i ? "checkmark-circle" : step.icon}
                    size={18}
                    color={
                      loadingStep > i
                        ? Colors.light.green
                        : loadingStep === i
                        ? Colors.light.tint
                        : Colors.light.textTertiary
                    }
                  />
                  <Text
                    style={[
                      styles.stepText,
                      {
                        color:
                          loadingStep > i
                            ? Colors.light.green
                            : loadingStep === i
                            ? Colors.light.text
                            : Colors.light.textTertiary,
                      },
                    ]}
                  >
                    {step.text}
                  </Text>
                  {loadingStep === i && (
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.tint}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {scanState === "error" && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCircle}>
              <Ionicons name="alert-circle" size={40} color={Colors.light.red} />
            </View>
            <Text style={styles.errorTitle}>Couldn't analyze</Text>
            <Text style={styles.errorMessage}>{errorMsg}</Text>
            <View style={styles.errorActions}>
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
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Take a Photo Instead</Text>
              </Pressable>
              <Pressable
                onPress={resetScan}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.light.tint} />
                <Text style={styles.secondaryBtnText}>Back to Home</Text>
              </Pressable>
            </View>
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
  idleScroll: {
    flexGrow: 1,
    justifyContent: "center" as const,
    paddingBottom: 20,
  },
  hero: {
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 24,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 28,
    color: Colors.light.text,
    textAlign: "center" as const,
  },
  heroTagline: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
  },
  valueProps: {
    gap: 14,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  valuePropRow: {
    flexDirection: "row" as const,
    gap: 12,
    alignItems: "flex-start" as const,
  },
  valuePropIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 2,
  },
  valuePropText: {
    flex: 1,
    gap: 2,
  },
  valuePropTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
  },
  valuePropDesc: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12.5,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  actions: {
    gap: 10,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  actionHalf: {
    flex: 1,
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
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
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
    gap: 16,
  },
  loadingCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.tintLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 4,
  },
  loadingTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 20,
    color: Colors.light.text,
  },
  loadingSteps: {
    gap: 14,
    marginTop: 8,
    alignSelf: "stretch" as const,
    paddingHorizontal: 20,
  },
  stepRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  stepText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    flex: 1,
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
  errorActions: {
    gap: 10,
    alignSelf: "stretch" as const,
    marginTop: 12,
  },
  barcodeContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  barcodeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  barcodeOverlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  barcodeOverlayMiddle: {
    flexDirection: "row" as const,
    height: 200,
  },
  barcodeOverlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  barcodeScanGuide: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 16,
  },
  barcodeOverlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center" as const,
    paddingTop: 32,
  },
  barcodeScanText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: "#fff",
  },
  barcodeCloseBtn: {
    position: "absolute" as const,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
