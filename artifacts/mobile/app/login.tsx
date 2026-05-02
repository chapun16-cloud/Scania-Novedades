import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import type { AuthUser } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { fetchAllowedUsers, type AllowedUser } from "@/services/api";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AllowedUser | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["allowedUsers"],
    queryFn: fetchAllowedUsers,
  });

  const filtered = users.filter((u) =>
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const supervisors = filtered.filter((u) => u.isSupervisor);
  const technicians = filtered.filter((u) => !u.isSupervisor);

  const handleSelect = async (user: AllowedUser) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const authUser: AuthUser = {
      displayName: user.displayName,
      role: user.isSupervisor ? "supervisor" : "technician",
      defaultShift: user.defaultShift ?? "Tarde/Cierre",
    };
    await login(authUser);
    setLoading(false);
    router.replace("/(tabs)");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  type Item = { type: "header"; title: string } | { type: "user"; user: AllowedUser };

  const listData: Item[] = [
    ...(supervisors.length > 0 ? [{ type: "header" as const, title: "Supervisores" }, ...supervisors.map((u) => ({ type: "user" as const, user: u }))] : []),
    ...(technicians.length > 0 ? [{ type: "header" as const, title: "Técnicos" }, ...technicians.map((u) => ({ type: "user" as const, user: u }))] : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 24, paddingBottom: botPad }]}>
      <View style={styles.hero}>
        <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={[styles.brand, { color: colors.primary }]}>SCANIA</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Partes Técnicos y Supervisión</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.searchIcon, { color: colors.mutedForeground }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Buscar nombre..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.selectLabel, { color: colors.mutedForeground }]}>Seleccioná tu nombre para ingresar</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>No se pudo conectar al servidor</Text>
          <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>Verificá tu conexión a Internet</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, idx) => (item.type === "header" ? `h-${item.title}` : `u-${item.user.id}-${idx}`)}
          renderItem={({ item }) => {
            if (item.type === "header") {
              return (
                <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{item.title.toUpperCase()}</Text>
              );
            }
            const u = item.user;
            const isSelected = selected?.id === u.id;
            return (
              <TouchableOpacity
                style={[styles.userRow, {
                  backgroundColor: isSelected ? colors.secondary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                }]}
                onPress={() => setSelected(u)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, { backgroundColor: u.isSupervisor ? colors.primary : colors.secondary }]}>
                  <Text style={[styles.avatarText, { color: u.isSupervisor ? colors.primaryForeground : colors.primary }]}>
                    {u.displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>{u.displayName}</Text>
                  {u.defaultShift ? (
                    <Text style={[styles.userShift, { color: colors.mutedForeground }]}>{u.defaultShift}</Text>
                  ) : null}
                </View>
                {u.isSupervisor && (
                  <View style={[styles.supBadge, { backgroundColor: "#EEF2FF" }]}>
                    <Text style={[styles.supText, { color: "#4338CA" }]}>Supervisor</Text>
                  </View>
                )}
                {isSelected && <Text style={{ color: colors.primary, fontSize: 20 }}>✓</Text>}
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          scrollEnabled={!!(listData.length > 0)}
        />
      )}

      {selected && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: botPad > 0 ? botPad : 16 }]}>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={() => handleSelect(selected)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>
                Ingresar como {selected.displayName.split(" ")[0]}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  brand: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  selectLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  errorSub: {
    fontSize: 13,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  userShift: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  supBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  supText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
