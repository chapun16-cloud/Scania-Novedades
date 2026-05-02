import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Stepper } from "@/components/Stepper";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { createReport } from "@/services/api";

const SHIFTS = ["Mañana", "Tarde/Cierre", "Noche"] as const;

function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0] as string;
}
function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0] as string;
}
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

type FormState = {
  workDate: string;
  shiftLabel: (typeof SHIFTS)[number] | "";
  serviceActivity: string;
  overtime50Normal: number;
  overtime50NormalKm40: number;
  overtime50WeekendHoliday: number;
  overtime50WeekendHolidayKm40: number;
  overtime100Normal: number;
  overtime100NormalKm40: number;
  overtime100WeekendHoliday: number;
  overtime100WeekendHolidayKm40: number;
  soloKm40: boolean;
  soloKm40Hours: number;
  technicalAssistanceGuard: number;
  fieldActivation: number;
  guard: boolean;
  notes: string;
};

const INITIAL: FormState = {
  workDate: todayISO(),
  shiftLabel: "",
  serviceActivity: "",
  overtime50Normal: 0,
  overtime50NormalKm40: 0,
  overtime50WeekendHoliday: 0,
  overtime50WeekendHolidayKm40: 0,
  overtime100Normal: 0,
  overtime100NormalKm40: 0,
  overtime100WeekendHoliday: 0,
  overtime100WeekendHolidayKm40: 0,
  soloKm40: false,
  soloKm40Hours: 0,
  technicalAssistanceGuard: 0,
  fieldActivation: 0,
  guard: false,
  notes: "",
};

function SectionHeader({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[sStyles.sectionHeader, { borderBottomColor: colors.border }]}>
      <Text style={[sStyles.sectionTitle, { color: colors.primary }]}>{title}</Text>
    </View>
  );
}

const sStyles = StyleSheet.create({
  sectionHeader: { borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4, marginTop: 18 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
});

export default function NuevoParte() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({ ...INITIAL, shiftLabel: (user?.defaultShift as (typeof SHIFTS)[number] | "") ?? "" });
  const [dateMode, setDateMode] = useState<"today" | "yesterday" | "custom">("today");

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const mutation = useMutation({
    mutationFn: () =>
      createReport({
        displayName: user!.displayName,
        ownerName: user!.displayName,
        technicianName: user!.displayName,
        ...form,
      }),
    onSuccess: () => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["myReports"] });
      setForm({ ...INITIAL, shiftLabel: (user?.defaultShift as (typeof SHIFTS)[number] | "") ?? "" });
      setDateMode("today");
      Alert.alert("✓ Parte enviado", "Tu parte fue registrado correctamente.");
    },
    onError: (err: Error) => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", err.message);
    },
  });

  const handleDateMode = (mode: "today" | "yesterday" | "custom") => {
    setDateMode(mode);
    if (mode === "today") set("workDate", todayISO());
    if (mode === "yesterday") set("workDate", yesterdayISO());
  };

  const handleSubmit = () => {
    if (!form.serviceActivity.trim()) {
      Alert.alert("Campo requerido", "Completá la descripción de la actividad.");
      return;
    }
    if (!form.shiftLabel) {
      Alert.alert("Campo requerido", "Seleccioná el turno.");
      return;
    }
    mutation.mutate();
  };

  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : 0;

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={80}
    >
      <View style={{ height: topPad }} />

      {/* Fecha */}
      <SectionHeader title="FECHA Y TURNO" colors={colors} />
      <View style={styles.dateRow}>
        {(["today", "yesterday"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.dateBtn, { backgroundColor: dateMode === mode ? colors.primary : colors.secondary, borderColor: dateMode === mode ? colors.primary : colors.border }]}
            onPress={() => handleDateMode(mode)}
          >
            <Text style={[styles.dateBtnText, { color: dateMode === mode ? colors.primaryForeground : colors.foreground }]}>
              {mode === "today" ? "Hoy" : "Ayer"}
            </Text>
            <Text style={[styles.dateBtnSub, { color: dateMode === mode ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
              {formatDate(mode === "today" ? todayISO() : yesterdayISO())}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.dateBtn, { backgroundColor: dateMode === "custom" ? colors.primary : colors.secondary, borderColor: dateMode === "custom" ? colors.primary : colors.border, flex: 1.2 }]}
          onPress={() => handleDateMode("custom")}
        >
          <Text style={[styles.dateBtnText, { color: dateMode === "custom" ? colors.primaryForeground : colors.foreground }]}>Otra fecha</Text>
        </TouchableOpacity>
      </View>

      {dateMode === "custom" && (
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
          value={form.workDate}
          onChangeText={(v) => set("workDate", v)}
          keyboardType="numeric"
        />
      )}

      {/* Turno */}
      <View style={styles.shiftRow}>
        {SHIFTS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.shiftBtn, {
              flex: 1,
              backgroundColor: form.shiftLabel === s ? colors.primary : colors.card,
              borderColor: form.shiftLabel === s ? colors.primary : colors.border,
            }]}
            onPress={() => set("shiftLabel", s)}
          >
            <Text style={[styles.shiftBtnText, { color: form.shiftLabel === s ? colors.primaryForeground : colors.foreground }]}>
              {s === "Tarde/Cierre" ? "Tarde" : s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actividad */}
      <SectionHeader title="ACTIVIDAD" colors={colors} />
      <TextInput
        style={[styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]}
        placeholder="Describí la actividad realizada..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={3}
        value={form.serviceActivity}
        onChangeText={(v) => set("serviceActivity", v)}
        textAlignVertical="top"
      />

      {/* 50% */}
      <SectionHeader title="HORAS EXTRA 50%" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Stepper label="Normal" value={form.overtime50Normal} onChange={(v) => set("overtime50Normal", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Normal >40km" value={form.overtime50NormalKm40} onChange={(v) => set("overtime50NormalKm40", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Fin de semana / Feriado" value={form.overtime50WeekendHoliday} onChange={(v) => set("overtime50WeekendHoliday", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Fin semana / Feriado >40km" value={form.overtime50WeekendHolidayKm40} onChange={(v) => set("overtime50WeekendHolidayKm40", v)} />
      </View>

      {/* 100% */}
      <SectionHeader title="HORAS EXTRA 100%" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Stepper label="Normal" value={form.overtime100Normal} onChange={(v) => set("overtime100Normal", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Normal >40km" value={form.overtime100NormalKm40} onChange={(v) => set("overtime100NormalKm40", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Fin de semana / Feriado" value={form.overtime100WeekendHoliday} onChange={(v) => set("overtime100WeekendHoliday", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Fin semana / Feriado >40km" value={form.overtime100WeekendHolidayKm40} onChange={(v) => set("overtime100WeekendHolidayKm40", v)} />
      </View>

      {/* Adicionales */}
      <SectionHeader title="ADICIONALES" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.foreground }]}>Solo >40km</Text>
          <Switch
            value={form.soloKm40}
            onValueChange={(v) => {
              set("soloKm40", v);
              if (!v) set("soloKm40Hours", 0);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === "android" ? (form.soloKm40 ? colors.primaryForeground : colors.card) : undefined}
          />
        </View>
        {form.soloKm40 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Stepper label="Horas solo >40km" value={form.soloKm40Hours} onChange={(v) => set("soloKm40Hours", v)} />
          </>
        )}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Guardia asistencia técnica" value={form.technicalAssistanceGuard} onChange={(v) => set("technicalAssistanceGuard", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stepper label="Activación en campo" value={form.fieldActivation} onChange={(v) => set("fieldActivation", v)} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { color: colors.foreground }]}>Adicional Guardia Semanal</Text>
            <Text style={[styles.switchSub, { color: colors.mutedForeground }]}>Máximo 4 por mes</Text>
          </View>
          <Switch
            value={form.guard}
            onValueChange={(v) => set("guard", v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === "android" ? (form.guard ? colors.primaryForeground : colors.card) : undefined}
          />
        </View>
      </View>

      {/* Notas */}
      <SectionHeader title="NOTAS (opcional)" colors={colors} />
      <TextInput
        style={[styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]}
        placeholder="Observaciones adicionales..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={2}
        value={form.notes}
        onChangeText={(v) => set("notes", v)}
        textAlignVertical="top"
      />

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: mutation.isPending ? colors.muted : colors.primary, marginTop: 24 }]}
        onPress={handleSubmit}
        disabled={mutation.isPending}
        activeOpacity={0.8}
      >
        <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
          {mutation.isPending ? "Enviando..." : "Enviar Parte"}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  dateRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  dateBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
  },
  dateBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dateBtnSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  shiftRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  shiftBtn: { borderRadius: 8, borderWidth: 1, paddingVertical: 10, alignItems: "center" },
  shiftBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  input: {
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginTop: 8,
  },
  textarea: {
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, minHeight: 70, marginTop: 8,
  },
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, marginTop: 4 },
  divider: { height: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  switchLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  switchSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  submitBtn: { borderRadius: 14, paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 17, fontFamily: "Inter_700Bold" },
});
