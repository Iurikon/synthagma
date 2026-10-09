import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import { Gradients } from "../constants/theme";

interface Props {
  children: React.ReactNode;
  variant?: "primary" | "card";
  style?: any;
}

export default function GradientBackground({
  children,
  variant = "primary",
  style,
}: Props) {
  return (
    <LinearGradient
      colors={variant === "card" ? Gradients.bgCard : Gradients.bgPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
