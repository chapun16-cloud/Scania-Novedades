import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
};

export function Stepper({ value, onChange, min = 0, max = 24, step = 1, label }: Props) {
  const colors = useColors();

  const dec = () => {
    if (value <= min) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.max(min, value - step));
  };
  const inc = () => {
    if (value >= max) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.min(max, value + step));
  };

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: value > 0 ? colors.foreground : colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.control, { borderColor: colors.border, backgroundColor: value > 0 ? colors.secondary : colors.muted }]}>
        <TouchableOpacity onPress={dec} style={[styles.btn, { opacity: value <= min ? 0.35 : 1 }]} disabled={value <= min} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={[styles.btnText, { color: colors.primary }]}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.value, { color: value > 0 ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          {value}
        </Text>
        <TouchableOpacity onPress={inc} style={[styles.btn, { opacity: value >= max ? 0.35 : 1 }]} disabled={value >= max} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={[styles.btnText, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
    paddingRight: 8,
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  btn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: "Inter_500Medium",
  },
  value: {
    width: 32,
    textAlign: "center",
    fontSize: 15,
  },
});
