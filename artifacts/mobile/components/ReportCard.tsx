import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { ServiceReport } from "@/services/api";
import { totalHours100, totalHours50 } from "@/services/api";

type Props = {
  report: ServiceReport;
  showOwner?: boolean;
};

const SHIFT_COLORS: Record<string, { bg: string; text: string }> = {
  "Mañana": { bg: "#FEF3C7", text: "#92400E" },
  "Tarde/Cierre": { bg: "#DBEAFE", text: "#1E40AF" },
  "Noche": { bg: "#EDE9FE", text: "#5B21B6" },
};

export function ReportCard({ report, showOwner = false }: Props) {
  const colors = useColors();
  const h50 = totalHours50(report);
  const h100 = totalHours100(report);
  const shiftColor = SHIFT_COLORS[report.shiftLabel] ?? { bg: colors.muted, text: colors.mutedForeground };

  const dateStr = (() => {
    try {
      const [y, m, d] = report.workDate.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return report.workDate;
    }
  })();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.dateRow}>
          <Text style={[styles.date, { color: colors.text }]}>{dateStr}</Text>
          {report.shiftLabel ? (
            <View style={[styles.shiftBadge, { backgroundColor: shiftColor.bg }]}>
              <Text style={[styles.shiftText, { color: shiftColor.text }]}>{report.shiftLabel}</Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: report.reviewed ? "#DCFCE7" : "#FEF3C7" }]}>
          <Text style={[styles.statusText, { color: report.reviewed ? "#166534" : "#92400E" }]}>
            {report.reviewed ? "Revisado" : "Pendiente"}
          </Text>
        </View>
      </View>

      {showOwner && (
        <Text style={[styles.ownerName, { color: colors.primary }]} numberOfLines={1}>
          {report.ownerName}
        </Text>
      )}

      <Text style={[styles.activity, { color: colors.foreground }]} numberOfLines={2}>
        {report.serviceActivity}
      </Text>

      <View style={styles.hoursRow}>
        {h50 > 0 && (
          <View style={[styles.hourChip, { backgroundColor: "#FFF7ED" }]}>
            <Text style={[styles.hourLabel, { color: "#C2410C" }]}>50%</Text>
            <Text style={[styles.hourValue, { color: "#C2410C" }]}>{h50}h</Text>
          </View>
        )}
        {h100 > 0 && (
          <View style={[styles.hourChip, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.hourLabel, { color: "#991B1B" }]}>100%</Text>
            <Text style={[styles.hourValue, { color: "#991B1B" }]}>{h100}h</Text>
          </View>
        )}
        {report.guard && (
          <View style={[styles.hourChip, { backgroundColor: "#EDE9FE" }]}>
            <Text style={[styles.hourLabel, { color: "#6D28D9" }]}>Guardia</Text>
          </View>
        )}
        {report.technicalAssistanceGuard > 0 && (
          <View style={[styles.hourChip, { backgroundColor: "#E0F2FE" }]}>
            <Text style={[styles.hourLabel, { color: "#0369A1" }]}>Asistencia {report.technicalAssistanceGuard}h</Text>
          </View>
        )}
        {report.fieldActivation > 0 && (
          <View style={[styles.hourChip, { backgroundColor: "#ECFDF5" }]}>
            <Text style={[styles.hourLabel, { color: "#065F46" }]}>Activación {report.fieldActivation}h</Text>
          </View>
        )}
        {h50 === 0 && h100 === 0 && !report.guard && report.technicalAssistanceGuard === 0 && report.fieldActivation === 0 && (
          <Text style={[styles.noHours, { color: colors.mutedForeground }]}>Sin horas extra</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  shiftBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  shiftText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  ownerName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  activity: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  hourChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
  },
  hourLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  hourValue: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  noHours: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
