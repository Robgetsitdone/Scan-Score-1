import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";
import { ScoreTier } from "@/lib/types";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function getScoreColor(score: number): string {
  if (score >= 90) return Colors.light.scoreExcellent;
  if (score >= 80) return Colors.light.scoreGood;
  if (score >= 70) return Colors.light.scoreCaution;
  if (score >= 60) return Colors.light.scoreLimit;
  if (score >= 50) return Colors.light.scoreTreat;
  return Colors.light.scoreAvoid;
}

function getTierGuidance(tier: ScoreTier): string {
  switch (tier) {
    case "Excellent":
      return "A great choice for everyday eating";
    case "Good":
      return "Solid pick, enjoy regularly";
    case "Don't eat often":
      return "Fine occasionally, not everyday";
    case "Limit / rarely":
      return "Keep this one to special occasions";
    case "Treat / very infrequent":
      return "Indulge very sparingly";
    case "Probably avoid":
      return "Consider a better alternative";
  }
}

interface ScoreCircleProps {
  score: number;
  tier: ScoreTier;
  size?: number;
  animated?: boolean;
}

export default function ScoreCircle({
  score,
  tier,
  size = 160,
  animated = true,
}: ScoreCircleProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(score / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = score / 100;
    }
  }, [score, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.circleWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.light.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[styles.scoreInner, { width: size, height: size }]}>
          <Text style={[styles.scoreNumber, { color, fontSize: size * 0.3 }]}>
            {score}
          </Text>
          <Text style={[styles.scoreLabel, { fontSize: size * 0.075 }]}>
            out of 100
          </Text>
        </View>
      </View>
      <Text style={[styles.tier, { color }]}>{tier}</Text>
      <Text style={styles.guidance}>{getTierGuidance(tier)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  circleWrapper: {
    position: "relative" as const,
  },
  scoreInner: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontFamily: "DMSans_700Bold",
    lineHeight: 56,
  },
  scoreLabel: {
    fontFamily: "DMSans_400Regular",
    color: Colors.light.textTertiary,
    marginTop: -2,
  },
  tier: {
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
    marginTop: 8,
  },
  guidance: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
  },
});
