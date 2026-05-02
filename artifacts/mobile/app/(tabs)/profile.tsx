import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : 0;

  const initials = user?.displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Querés salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const SHIFT_COLORS: Record<string, { bg: string; text: string }> = {
    "Mañana": { bg: "#FEF3C7", text: "#92400E" },
    "Tarde/Cierre": { bg: "#DBEAFE", text: "#1E40AF" },
    "Noche": { bg: "#EDE9FE", text: "#5B21B6" },
  };

  const shiftColor = SHIFT_COLORS[user?.defaultShift ?? ""] ?? { bg: colors.muted, text: colors.mutedForeground };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: botPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & Name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: user?.role === "supervisor" ? colors.primary : colors.secondary }]}>
          <Text style={[styles.avatarText, { color: user?.role === "supervisor" ? colors.primaryForeground : colors.primary }]}>
            {initials}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.displayName}</Text>
        <View style={[styles.roleBadge, { backgroundColor: user?.role === "supervisor" ? "#EEF2FF" : colors.secondary }]}>
          <Text style={[styles.roleText, { color: user?.role === "supervisor" ? "#4338CA" : colors.primary }]}>
            {user?.role === "supervisor" ? "Supervisor" : "Técnico"}
          </Text>
        </View>
      </View>

      {/* Info card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Turno asignado</Text>
          <View style={[styles.shiftBadge, { backgroundColor: shiftColor.bg }]}>
            <Text style={[styles.shiftText, { color: shiftColor.text }]}>{user?.defaultShift ?? "—"}</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Rol</Text>
          <Text style={[styles.rowValue, { color: colors.foreground }]}>
            {user?.role === "supervisor" ? "Supervisor" : "Técnico"}
          </Text>
        </View>
      </View>

      {/* Info about app */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Aplicación</Text>
          <Text style={[styles.rowValue, { color: colors.foreground }]}>SCANIA Partes</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Versión</Text>
          <Text style={[styles.rowValue, { color: colors.foreground }]}>1.0.0</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.destructive }]}
        onPress={handleLogout}
        activeOpacity={0.75}
      >
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18 },
  avatarSection: { alignItems: "center", marginBottom: 28 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontFamily: "Inter_700Bold" },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  roleBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  roleText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  shiftBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  shiftText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  divider: { height: 1 },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
