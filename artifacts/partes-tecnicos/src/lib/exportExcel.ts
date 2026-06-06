import * as XLSX from "xlsx-js-style";
import type { ServiceReport } from "@workspace/api-client-react";

export type DeletedReport = ServiceReport & { deletedAt?: string | null; deletedBy?: string | null };

interface TechnicianTotals {
  apellido: string;
  nombre: string;
  legajo: string;
  sucursal: string;
  weeklyGuardCount: number;
  technicalAssistanceGuard: number;
  fieldActivation: number;
  overtime50WeekendHoliday: number;
  overtime50Normal: number;
  overtime100WeekendHoliday: number;
  overtime100Normal: number;
  overtime50WeekendHolidayKm40: number;
  overtime50NormalKm40: number;
  overtime100WeekendHolidayKm40: number;
  overtime100NormalKm40: number;
  soloKm40Hours: number;
  notes: string;
}

function splitName(fullName: string): { apellido: string; nombre: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
  const nombre = parts[0];
  const apellido = parts.slice(1).join(" ");
  return { nombre, apellido };
}

function groupByTechnician(reports: ServiceReport[]): TechnicianTotals[] {
  const map = new Map<string, TechnicianTotals>();

  for (const r of reports) {
    const key = r.ownerUserId || r.technicianName;
    if (!map.has(key)) {
      const { nombre, apellido } = splitName(r.ownerName || r.technicianName);
      map.set(key, {
        apellido,
        nombre,
        legajo: "",
        sucursal: "NORTE",
        weeklyGuardCount: 0,
        technicalAssistanceGuard: 0,
        fieldActivation: 0,
        overtime50WeekendHoliday: 0,
        overtime50Normal: 0,
        overtime100WeekendHoliday: 0,
        overtime100Normal: 0,
        overtime50WeekendHolidayKm40: 0,
        overtime50NormalKm40: 0,
        overtime100WeekendHolidayKm40: 0,
        overtime100NormalKm40: 0,
        soloKm40Hours: 0,
        notes: "",
      });
    }
    const t = map.get(key)!;
    if (r.guard) t.weeklyGuardCount += 1;
    t.technicalAssistanceGuard += Number(r.technicalAssistanceGuard ?? 0);
    t.fieldActivation += Number(r.fieldActivation ?? 0);
    t.overtime50WeekendHoliday += Number(r.overtime50WeekendHoliday ?? 0);
    t.overtime50Normal += Number(r.overtime50Normal ?? 0);
    t.overtime100WeekendHoliday += Number(r.overtime100WeekendHoliday ?? 0);
    t.overtime100Normal += Number(r.overtime100Normal ?? 0);
    t.overtime50WeekendHolidayKm40 += Number(r.overtime50WeekendHolidayKm40 ?? 0);
    t.overtime50NormalKm40 += Number(r.overtime50NormalKm40 ?? 0);
    t.overtime100WeekendHolidayKm40 += Number(r.overtime100WeekendHolidayKm40 ?? 0);
    t.overtime100NormalKm40 += Number(r.overtime100NormalKm40 ?? 0);
    t.soloKm40Hours += Number(r.soloKm40Hours ?? 0);
    if (r.notes) t.notes = [t.notes, r.notes].filter(Boolean).join("; ");
  }

  return Array.from(map.values()).sort((a, b) =>
    a.apellido.localeCompare(b.apellido, "es"),
  );
}

export function exportReportsToExcel(reports: ServiceReport[], filename?: string) {
  const technicians = groupByTechnician(reports);

  const sheetData: (string | number)[][] = [
    // Row 1
    [
      "Legajo", "Sucursal", "Apellido", "Nombre",
      "Guardias", "Activaciones SOS",
      "Horas Extras Normales ( No incluye Assistance)", "", "", "",
      "Suplemento viatico - > Asistencia Técnica", "", "", "", "", "",
      "DESCONTAR", "", "",
      "Otros Comentarios  - Especificar",
    ],
    // Row 2
    [
      "", "", "", "",
      "Asistencia Técnica", "Utilización SOS",
      "", "", "", "",
      "Horas Extras a más de 40 km.", "", "", "", "Horas Normales",
      "Total de Horas de Suplemento Viatico",
      "", "", "", "",
    ],
    // Row 3
    [
      "", "", "", "", "", "",
      "Fin de semana, Feriados y Día Inhabiles", "Resto",
      "Fin de semana, Feriados y Día Inhabiles", "Resto",
      "Fin de semana, Feriados y Día Inhabiles", "Resto",
      "Fin de semana, Feriados y Día Inhabiles", "Resto",
      "", "", "", "", "", "",
    ],
    // Row 4
    [
      "", "", "", "", "", "",
      "Al 50%", "", "Al 100%", "",
      "Al 50%", "", "Al 100%", "",
      "", "", "", "", "", "",
    ],
    // Row 5
    [
      "", "", "", "", "52,01", "52,04",
      "Horas", "Horas", "Horas", "Horas",
      "Horas", "Horas", "Horas", "Horas",
      "Horas", "Horas",
      "Lic sin Goce de Sueldo", "Ausencias Injustificadas", "Horas",
      "N° OT, Ausencias por Vacaciones, días flex, otras ausencias",
    ],
    // Row 6 (official codes per column)
    [
      "", "", "", "",
      "52,01", "52,04",
      "41,5", "41", "42,5", "42",
      "41,57", "41,17", "42,57", "42,17",
      "", "53",
      "", "", "", "",
    ],
    // Row 7 (descriptive note row)
    [
      "", "", "", "",
      "Cargar cantidad de Guardias", "Cargar cantidad de Utilizaciones",
      "", "", "", "", "", "", "", "", "", "", "", "", "",
      "N° OT, Ausencias por Vacaciones, días flex, otras ausencias",
    ],
    // Row 8 (empty separator)
    Array(20).fill(""),
  ];

  // Data rows — one per technician
  for (const t of technicians) {
    sheetData.push([
      t.legajo,
      t.sucursal,
      t.apellido,
      t.nombre,
      (t.weeklyGuardCount + t.technicalAssistanceGuard) || "",
      t.fieldActivation || "",
      t.overtime50WeekendHoliday || "",
      t.overtime50Normal || "",
      t.overtime100WeekendHoliday || "",
      t.overtime100Normal || "",
      t.overtime50WeekendHolidayKm40 || "",
      t.overtime50NormalKm40 || "",
      t.overtime100WeekendHolidayKm40 || "",
      t.overtime100NormalKm40 || "",
      "",
      t.soloKm40Hours || "",
      "",
      "",
      "",
      t.notes || "",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // ── Cell styles matching the original Scania form ──────────────────────────
  // xlsx-js-style uses nested fill object + ARGB hex (8 chars, "FF" alpha prefix)
  type CellStyle = {
    fill: { patternType: string; fgColor: { rgb: string } };
  };

  const solidFill = (hex6: string): CellStyle => ({
    fill: { patternType: "solid", fgColor: { rgb: "FF" + hex6 } },
  });

  const NAVY   = "203864"; // dark navy — identity cols & DESCONTAR
  const CYAN   = "CCFFFF"; // light cyan — Guardias & Activaciones
  const GRAY   = "808080"; // medium gray — codes row
  const YELLOW = "FFFF00"; // yellow — descriptive note row

  const setStyle = (r: number, c: number, style: CellStyle) => {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (!ws[addr]) ws[addr] = { t: "s", v: "" };
    (ws[addr] as Record<string, unknown>).s = style;
  };

  // Rows 0-4: multi-row header block
  for (let r = 0; r <= 4; r++) {
    for (let c = 0; c <= 19; c++) {
      if (c <= 3) {
        setStyle(r, c, solidFill(NAVY));
      } else if (c <= 5) {
        setStyle(r, c, solidFill(CYAN));
      } else if (c >= 16) {
        setStyle(r, c, solidFill(NAVY));
      }
      // cols 6-15: no fill (white — left as default)
    }
  }

  // Row 5 (index 5): official codes — medium gray
  for (let c = 0; c <= 19; c++) {
    setStyle(5, c, solidFill(GRAY));
  }

  // Row 6 (index 6): descriptive note — yellow on E, F, T
  for (let c = 0; c <= 19; c++) {
    if (c === 4 || c === 5 || c === 19) {
      setStyle(6, c, solidFill(YELLOW));
    }
  }
  // ── End styles ─────────────────────────────────────────────────────────────

  // Merge cells for the multi-row headers
  ws["!merges"] = [
    // Legajo
    { s: { r: 0, c: 0 }, e: { r: 4, c: 0 } },
    // Sucursal
    { s: { r: 0, c: 1 }, e: { r: 4, c: 1 } },
    // Apellido
    { s: { r: 0, c: 2 }, e: { r: 4, c: 2 } },
    // Nombre
    { s: { r: 0, c: 3 }, e: { r: 4, c: 3 } },
    // Guardias
    { s: { r: 0, c: 4 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 4 }, e: { r: 4, c: 4 } },
    // Activaciones SOS
    { s: { r: 0, c: 5 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 5 }, e: { r: 4, c: 5 } },
    // Horas Extras Normales — spans cols 6-9
    { s: { r: 0, c: 6 }, e: { r: 0, c: 9 } },
    // Fin de Sem/Fer 50% → cols 6, rows 2-3
    { s: { r: 2, c: 6 }, e: { r: 3, c: 6 } },
    // Resto 50% → col 7, rows 2-3
    { s: { r: 2, c: 7 }, e: { r: 3, c: 7 } },
    // Fin de Sem/Fer 100% → col 8, rows 2-3
    { s: { r: 2, c: 8 }, e: { r: 3, c: 8 } },
    // Resto 100% → col 9, rows 2-3
    { s: { r: 2, c: 9 }, e: { r: 3, c: 9 } },
    // Suplemento viatico header — spans cols 10-15
    { s: { r: 0, c: 10 }, e: { r: 0, c: 15 } },
    // Horas Extras a más de 40 km. — cols 10-13, row 1
    { s: { r: 1, c: 10 }, e: { r: 1, c: 13 } },
    // Fin de Sem/Fer 50% km40 → col 10, rows 2-3
    { s: { r: 2, c: 10 }, e: { r: 3, c: 10 } },
    // Resto 50% km40 → col 11, rows 2-3
    { s: { r: 2, c: 11 }, e: { r: 3, c: 11 } },
    // Fin de Sem/Fer 100% km40 → col 12, rows 2-3
    { s: { r: 2, c: 12 }, e: { r: 3, c: 12 } },
    // Resto 100% km40 → col 13, rows 2-3
    { s: { r: 2, c: 13 }, e: { r: 3, c: 13 } },
    // Horas Normales — col 14, rows 0-4
    { s: { r: 0, c: 14 }, e: { r: 4, c: 14 } },
    // Total Horas Sup. Viatico — col 15, rows 1-4
    { s: { r: 1, c: 15 }, e: { r: 4, c: 15 } },
    // DESCONTAR — cols 16-18
    { s: { r: 0, c: 16 }, e: { r: 0, c: 18 } },
    // Lic sin Goce — col 16, rows 1-4
    { s: { r: 1, c: 16 }, e: { r: 4, c: 16 } },
    // Ausencias Injustificadas — col 17, rows 1-4
    { s: { r: 1, c: 17 }, e: { r: 4, c: 17 } },
    // Horas Descontar — col 18, rows 1-4
    { s: { r: 1, c: 18 }, e: { r: 4, c: 18 } },
    // Otros comentarios — col 19, rows 0-4
    { s: { r: 0, c: 19 }, e: { r: 4, c: 19 } },
  ];

  // Column widths
  ws["!cols"] = [
    { wch: 8 },  // Legajo
    { wch: 10 }, // Sucursal
    { wch: 18 }, // Apellido
    { wch: 16 }, // Nombre
    { wch: 10 }, // Guardias
    { wch: 10 }, // Activaciones
    { wch: 8 },  // HE 50% Fin Sem
    { wch: 8 },  // HE 50% Resto
    { wch: 8 },  // HE 100% Fin Sem
    { wch: 8 },  // HE 100% Resto
    { wch: 8 },  // km40 50% Fin Sem
    { wch: 8 },  // km40 50% Resto
    { wch: 8 },  // km40 100% Fin Sem
    { wch: 8 },  // km40 100% Resto
    { wch: 8 },  // Horas Normales
    { wch: 10 }, // Total Sup Viatico
    { wch: 10 }, // Lic sin Goce
    { wch: 10 }, // Ausencias Injust
    { wch: 8 },  // Horas Descontar
    { wch: 40 }, // Comentarios
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "NOVEDADES");

  const date = new Date();
  const period = `${String(date.getMonth() + 1).padStart(2, "0")}_${date.getFullYear()}`;
  const outputFilename = filename || `Novedades_SCANIA_${period}.xlsx`;

  XLSX.writeFile(wb, outputFilename);
}

export function exportDeletedReportsToExcel(reports: DeletedReport[], filename?: string) {
  const headers = [
    "ID Parte",
    "Técnico",
    "Fecha de Trabajo",
    "Turno",
    "Actividad",
    "Guardias",
    "Activaciones",
    "HE 50% Normal",
    "HE 50% Fin Sem/Fer",
    "HE 50% Normal Km40",
    "HE 50% Fin Sem/Fer Km40",
    "HE 100% Normal",
    "HE 100% Fin Sem/Fer",
    "HE 100% Normal Km40",
    "HE 100% Fin Sem/Fer Km40",
    "Solo Km40 Horas",
    "Notas",
    "Borrado por",
    "Fecha de Borrado",
  ];

  const rows = reports.map((r) => [
    r.id,
    r.ownerName || r.technicianName,
    r.workDate,
    r.shiftLabel || "",
    r.serviceActivity,
    r.technicalAssistanceGuard || "",
    r.fieldActivation || "",
    r.overtime50Normal || "",
    r.overtime50WeekendHoliday || "",
    r.overtime50NormalKm40 || "",
    r.overtime50WeekendHolidayKm40 || "",
    r.overtime100Normal || "",
    r.overtime100WeekendHoliday || "",
    r.overtime100NormalKm40 || "",
    r.overtime100WeekendHolidayKm40 || "",
    r.soloKm40Hours || "",
    r.notes || "",
    r.deletedBy || "",
    r.deletedAt ? new Date(r.deletedAt).toLocaleString("es-AR") : "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  ws["!cols"] = [
    { wch: 8 }, { wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 30 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
    { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "BORRADOS");

  const date = new Date();
  const period = `${String(date.getMonth() + 1).padStart(2, "0")}_${date.getFullYear()}`;
  const outputFilename = filename || `Partes_Borrados_SCANIA_${period}.xlsx`;

  XLSX.writeFile(wb, outputFilename);
}
