import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportCard } from "@/components/ReportCard";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { fetchMyReports, type ServiceReport } from "@/services/api";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["myReports", user?.displayName],
    queryFn: () => fetchMyReports(user!.displayName),
    enabled: !!user,
  });

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : 0;

  const isSupervisor = user?.role === "supervisor";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={[styles.center, { paddingTop: topPad + 20 }]}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Cargando partes...</Text>
        </View>
      ) : error ? (
        <View style={[styles.center, { paddingTop: topPad + 20 }]}>
          <Text style={[styles.errorTitle, { color: colors.destructive }]}>No se pudieron cargar los partes</Text>
          <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>{(error as Error).message}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]} onPress={() => refetch()}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<ServiceReport>
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ReportCard report={item} showOwner={isSupervisor} />}
          contentContainerStyle={[styles.list, { paddingTop: topPad + 8, paddingBottom: botPad + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyIcon, { color: colors.mutedForeground }]}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sin partes registrados</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {isSupervisor ? "No hay partes en el sistema todavía." : "Aún no enviaste ningún parte. Usá la pestaña \"Nuevo Parte\" para empezar."}
              </Text>
            </View>
          }
          ListHeaderComponent={
            data.length > 0 ? (
              <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: colors.primary }]}>{data.length}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: "#22C55E" }]}>{data.filter((r) => r.reviewed).length}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Revisados</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNum, { color: colors.warning }]}>{data.filter((r) => !r.reviewed).length}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Pendientes</Text>
                </View>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 24 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 8 },
  errorTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  errorSub: { fontSize: 13, textAlign: "center" },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 14 },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24, gap: 8 },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  summary: { borderRadius: 12, borderWidth: 1, flexDirection: "row", marginBottom: 14, overflow: "hidden" },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 14 },
  summaryNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  summaryDivider: { width: 1 },
  warning: {},
});
