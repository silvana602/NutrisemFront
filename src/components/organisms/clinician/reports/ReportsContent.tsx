"use client";

import React, { useMemo } from "react";
import { Download, FileBarChart2, Heart, LineChart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db, seedOnce } from "@/mocks/db";
import { useAuthStore } from "@/store/useAuthStore";
import { calculateAgeInMonths } from "@/lib/pediatricAge";

seedOnce();

type IndicatorId = "weightForAge" | "heightForAge" | "weightForHeight";
type IndicatorStatus = "severe_low" | "risk_low" | "normal" | "high";

type ConsultationDatasetRow = {
  consultationId: string;
  patientId: string;
  patientName: string;
  consultDate: Date;
  ageMonths: number;
  weightKg: number | null;
  heightCm: number | null;
  diagnosisLabel: string;
  zScore: number | null;
  breastfeedingStatus: string | null;
  indicatorStatus: Record<IndicatorId, IndicatorStatus | null>;
};

type IndicatorStatusSummary = {
  severeLow: number;
  riskLow: number;
  normal: number;
  high: number;
  total: number;
};

type TopDiagnosisItem = {
  label: string;
  count: number;
};

const AGE_RANGE_BUCKETS = [
  { from: 6, to: 11, weightMin: 6.5, weightMax: 11, heightMin: 65, heightMax: 78 },
  { from: 12, to: 23, weightMin: 8, weightMax: 13.5, heightMin: 73, heightMax: 90 },
  { from: 24, to: 35, weightMin: 10, weightMax: 16, heightMin: 83, heightMax: 98 },
  { from: 36, to: 47, weightMin: 12, weightMax: 19, heightMin: 92, heightMax: 106 },
  { from: 48, to: 60, weightMin: 14, weightMax: 22, heightMin: 100, heightMax: 115 },
] as const;

const WEIGHT_FOR_HEIGHT_BUCKETS = [
  { fromHeightCm: 65, toHeightCm: 74, weightMin: 6.5, weightMax: 9.8 },
  { fromHeightCm: 75, toHeightCm: 84, weightMin: 8, weightMax: 12 },
  { fromHeightCm: 85, toHeightCm: 94, weightMin: 10, weightMax: 15 },
  { fromHeightCm: 95, toHeightCm: 104, weightMin: 12, weightMax: 18.5 },
  { fromHeightCm: 105, toHeightCm: 115, weightMin: 14, weightMax: 22 },
] as const;

const WHO_Z_BANDS = [
  { key: "underMinus3", label: "< -3 DE", min: Number.NEGATIVE_INFINITY, max: -3 },
  { key: "betweenMinus3Minus2", label: "-3 a -2 DE", min: -3, max: -2 },
  { key: "betweenMinus2Minus1", label: "-2 a -1 DE", min: -2, max: -1 },
  { key: "betweenMinus1Plus1", label: "-1 a +1 DE", min: -1, max: 1 },
  { key: "betweenPlus1Plus2", label: "+1 a +2 DE", min: 1, max: 2 },
  { key: "overPlus2", label: "> +2 DE", min: 2, max: Number.POSITIVE_INFINITY },
] as const;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getAgeRange(ageMonths: number) {
  return AGE_RANGE_BUCKETS.find((range) => ageMonths >= range.from && ageMonths <= range.to) ?? null;
}

function getWeightForHeightRange(heightCm: number) {
  return WEIGHT_FOR_HEIGHT_BUCKETS.find(
    (range) => heightCm >= range.fromHeightCm && heightCm <= range.toHeightCm
  ) ?? null;
}

function classifyAgainstRange(
  value: number | null,
  minValue: number | null,
  maxValue: number | null
): IndicatorStatus | null {
  if (
    value === null ||
    minValue === null ||
    maxValue === null ||
    !Number.isFinite(value) ||
    !Number.isFinite(minValue) ||
    !Number.isFinite(maxValue)
  ) {
    return null;
  }

  if (value < minValue * 0.9) return "severe_low";
  if (value < minValue) return "risk_low";
  if (value > maxValue * 1.1) return "high";
  return "normal";
}

function getIndicatorSummary(rows: ConsultationDatasetRow[], indicator: IndicatorId): IndicatorStatusSummary {
  const summary: IndicatorStatusSummary = {
    severeLow: 0,
    riskLow: 0,
    normal: 0,
    high: 0,
    total: 0,
  };

  for (const row of rows) {
    const status = row.indicatorStatus[indicator];
    if (!status) continue;

    summary.total += 1;
    if (status === "severe_low") summary.severeLow += 1;
    if (status === "risk_low") summary.riskLow += 1;
    if (status === "normal") summary.normal += 1;
    if (status === "high") summary.high += 1;
  }

  return summary;
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function getStatusText(status: IndicatorStatus | null): string {
  if (!status) return "Sin dato";
  if (status === "severe_low") return "Deficit moderado/severo";
  if (status === "risk_low") return "Riesgo de deficit";
  if (status === "high") return "Alto para referencia";
  return "Normal";
}

type SpreadsheetCellValue = string | number | null | undefined;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSpreadsheetCellType(value: SpreadsheetCellValue): "Number" | "String" {
  if (typeof value === "number" && Number.isFinite(value)) return "Number";
  return "String";
}

function formatSpreadsheetCellValue(value: SpreadsheetCellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return String(value);
}

function sanitizeWorksheetName(name: string): string {
  const sanitized = name.replace(/[\\/*?:[\]]/g, " ").trim();
  return (sanitized || "Hoja").slice(0, 31);
}

function buildSpreadsheetXml(
  sheets: Array<{
    name: string;
    rows: SpreadsheetCellValue[][];
  }>
): string {
  const worksheetsXml = sheets
    .map((sheet) => {
      const worksheetName = sanitizeWorksheetName(sheet.name);
      const rowsXml = sheet.rows
        .map((row, rowIndex) => {
          const cellsXml = row
            .map((cell) => {
              const styleId = rowIndex === 0 ? ' ss:StyleID="Header"' : "";
              const type = getSpreadsheetCellType(cell);
              const value = escapeXml(formatSpreadsheetCellValue(cell));
              return `<Cell${styleId}><Data ss:Type="${type}">${value}</Data></Cell>`;
            })
            .join("");

          return `<Row>${cellsXml}</Row>`;
        })
        .join("");

      return `<Worksheet ss:Name="${escapeXml(worksheetName)}"><Table>${rowsXml}</Table></Worksheet>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E7E9E3" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  ${worksheetsXml}
</Workbook>`;
}

function inverseNormalCdf(probability: number): number {
  const p = Math.min(Math.max(probability, 1e-6), 1 - 1e-6);

  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
  ];

  const plow = 0.02425;
  const phigh = 1 - plow;

  if (p < plow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  if (p > phigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  const q = p - 0.5;
  const r = q * q;
  return (
    (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

function parseZScore(rawValue: number | null): number | null {
  if (rawValue === null || !Number.isFinite(rawValue)) return null;

  if (rawValue >= -6 && rawValue <= 6) {
    return rawValue;
  }

  if (rawValue >= 0 && rawValue <= 100) {
    const probability = rawValue / 100;
    return inverseNormalCdf(probability);
  }

  return null;
}

function inferTopDiagnosisTokens(diagnosisLabel: string, diagnosisDetails: string): string[] {
  const details = normalizeText(diagnosisDetails);
  const label = normalizeText(diagnosisLabel);
  const tokens: string[] = [];

  const keywordMap = [
    { key: "anemia", label: "Anemia" },
    { key: "talla baja", label: "Talla baja" },
    { key: "desnutricion aguda", label: "Desnutricion aguda" },
    { key: "desnutricion cronica", label: "Desnutricion cronica" },
    { key: "sobrepeso", label: "Sobrepeso" },
    { key: "obesidad", label: "Obesidad" },
  ] as const;

  for (const keyword of keywordMap) {
    if (details.includes(keyword.key) || label.includes(keyword.key)) {
      tokens.push(keyword.label);
    }
  }

  if (!tokens.length && label && label !== "sin diagnostico" && label !== "normal") {
    tokens.push(diagnosisLabel);
  }

  return tokens;
}

function isBreastfeedingMaintained(value: string | null): boolean {
  if (!value) return false;
  const normalized = normalizeText(value);
  if (!normalized) return false;
  if (normalized.includes("no")) return false;
  if (normalized.includes("nunca")) return false;
  if (normalized.includes("suspendida")) return false;
  return true;
}

type IndicatorBarProps = {
  title: string;
  subtitle: string;
  summary: IndicatorStatusSummary;
};

function IndicatorBarCard({ title, subtitle, summary }: IndicatorBarProps) {
  const severePercent = percentage(summary.severeLow, summary.total);
  const riskPercent = percentage(summary.riskLow, summary.total);
  const normalPercent = percentage(summary.normal, summary.total);
  const highPercent = percentage(summary.high, summary.total);

  return (
    <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-nutri-primary">{title}</h3>
      <p className="mt-1 text-xs text-nutri-dark-grey/80">{subtitle}</p>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full border border-nutri-light-grey bg-nutri-off-white">
        <div className="flex h-full w-full">
          <div style={{ width: `${severePercent}%` }} className="bg-rose-600" />
          <div style={{ width: `${riskPercent}%` }} className="bg-amber-400" />
          <div style={{ width: `${normalPercent}%` }} className="bg-emerald-500" />
          <div style={{ width: `${highPercent}%` }} className="bg-blue-500" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-nutri-dark-grey">
        <p>Deficit severo: {severePercent}%</p>
        <p>Riesgo: {riskPercent}%</p>
        <p>Normal: {normalPercent}%</p>
        <p>Alto: {highPercent}%</p>
      </div>
      <p className="mt-2 text-xs text-nutri-dark-grey/70">Casos analizados: {summary.total}</p>
    </article>
  );
}

export const ReportsContent: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const clinician = useMemo(
    () => (user ? db.clinicians.find((item) => item.userId === user.userId) ?? null : null),
    [user]
  );

  const datasetRows: ConsultationDatasetRow[] = useMemo(() => {
    if (!clinician) return [];

    const assignedPatientIds = new Set(
      db.patientClinicians
        .filter((item) => item.clinicianId === clinician.clinicianId)
        .map((item) => item.patientId)
    );

    return db.consultations
      .filter((consultation) => assignedPatientIds.has(consultation.patientId))
      .map((consultation) => {
        const patient = db.patients.find((item) => item.patientId === consultation.patientId) ?? null;
        if (!patient) return null;

        const patientUser = db.users.find((item) => item.userId === patient.userId) ?? null;
        const anthropometric =
          db.anthropometricData.find((item) => item.consultationId === consultation.consultationId) ?? null;
        const diagnosis =
          db.diagnoses.find((item) => item.consultationId === consultation.consultationId) ?? null;
        const antecedents =
          db.antecedents.find((item) => item.consultationId === consultation.consultationId) ?? null;

        const ageMonths = calculateAgeInMonths(patient.birthDate, consultation.date);
        const weightKg = anthropometric?.weightKg ?? null;
        const heightCm =
          typeof anthropometric?.heightM === "number"
            ? Number((anthropometric.heightM * 100).toFixed(1))
            : null;
        const ageRange = getAgeRange(ageMonths);
        const weightForHeightRange =
          typeof heightCm === "number" ? getWeightForHeightRange(heightCm) : null;

        return {
          consultationId: consultation.consultationId,
          patientId: patient.patientId,
          patientName: patientUser
            ? `${patientUser.firstName} ${patientUser.lastName}`
            : `${patient.firstName} ${patient.lastName}`,
          consultDate: consultation.date,
          ageMonths,
          weightKg,
          heightCm,
          diagnosisLabel: diagnosis?.nutritionalDiagnosis ?? "Sin diagnostico",
          zScore: parseZScore(diagnosis?.zScorePercentile ?? null),
          breastfeedingStatus: antecedents?.breastfeeding ?? null,
          indicatorStatus: {
            weightForAge: classifyAgainstRange(
              weightKg,
              ageRange?.weightMin ?? null,
              ageRange?.weightMax ?? null
            ),
            heightForAge: classifyAgainstRange(
              heightCm,
              ageRange?.heightMin ?? null,
              ageRange?.heightMax ?? null
            ),
            weightForHeight: classifyAgainstRange(
              weightKg,
              weightForHeightRange?.weightMin ?? null,
              weightForHeightRange?.weightMax ?? null
            ),
          },
        } satisfies ConsultationDatasetRow;
      })
      .filter((row): row is ConsultationDatasetRow => row !== null)
      .sort((first, second) => second.consultDate.getTime() - first.consultDate.getTime());
  }, [clinician]);

  const prevalenceWeightForAge = useMemo(
    () => getIndicatorSummary(datasetRows, "weightForAge"),
    [datasetRows]
  );
  const prevalenceHeightForAge = useMemo(
    () => getIndicatorSummary(datasetRows, "heightForAge"),
    [datasetRows]
  );
  const prevalenceWeightForHeight = useMemo(
    () => getIndicatorSummary(datasetRows, "weightForHeight"),
    [datasetRows]
  );

  const zScoreDistribution = useMemo(() => {
    const entries = WHO_Z_BANDS.map((band) => ({ label: band.label, count: 0 }));
    const available = datasetRows.filter((row) => row.zScore !== null);

    for (const row of available) {
      const z = row.zScore as number;
      for (let index = 0; index < WHO_Z_BANDS.length; index += 1) {
        const band = WHO_Z_BANDS[index];
        if (z >= band.min && z < band.max) {
          entries[index].count += 1;
          break;
        }
      }
    }

    const highestCount = Math.max(...entries.map((entry) => entry.count), 1);
    return { entries, highestCount, total: available.length };
  }, [datasetRows]);

  const topDiagnoses = useMemo<TopDiagnosisItem[]>(() => {
    const map = new Map<string, number>();

    for (const diagnosis of db.diagnoses) {
      const consultation = db.consultations.find(
        (item) => item.consultationId === diagnosis.consultationId
      );
      if (!consultation) continue;
      if (clinician && consultation.clinicianId !== clinician.clinicianId) continue;

      const labels = inferTopDiagnosisTokens(
        diagnosis.nutritionalDiagnosis ?? "Sin diagnostico",
        diagnosis.diagnosisDetails ?? ""
      );

      for (const label of labels) {
        map.set(label, (map.get(label) ?? 0) + 1);
      }
    }

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 6);
  }, [clinician]);

  const lactationReport = useMemo(() => {
    if (!clinician) {
      return {
        totalChildren6To24Months: 0,
        maintainedBreastfeeding: 0,
        maintainedPercent: 0,
      };
    }

    const assignedPatientIds = new Set(
      db.patientClinicians
        .filter((item) => item.clinicianId === clinician.clinicianId)
        .map((item) => item.patientId)
    );

    const latestConsultationsByPatient = db.consultations
      .filter((consultation) => assignedPatientIds.has(consultation.patientId))
      .sort((first, second) => second.date.getTime() - first.date.getTime())
      .reduce((map, consultation) => {
        if (!map.has(consultation.patientId)) {
          map.set(consultation.patientId, consultation);
        }
        return map;
      }, new Map<string, (typeof db.consultations)[number]>());

    let totalChildren6To24Months = 0;
    let maintainedBreastfeeding = 0;

    for (const consultation of latestConsultationsByPatient.values()) {
      const patient = db.patients.find((item) => item.patientId === consultation.patientId) ?? null;
      if (!patient) continue;

      const ageMonths = calculateAgeInMonths(patient.birthDate, consultation.date);
      if (ageMonths < 6 || ageMonths > 24) continue;

      totalChildren6To24Months += 1;
      const antecedents = db.antecedents.find(
        (item) => item.consultationId === consultation.consultationId
      );

      if (isBreastfeedingMaintained(antecedents?.breastfeeding ?? null)) {
        maintainedBreastfeeding += 1;
      }
    }

    return {
      totalChildren6To24Months,
      maintainedBreastfeeding,
      maintainedPercent: percentage(maintainedBreastfeeding, totalChildren6To24Months),
    };
  }, [clinician]);

  const exportRows = useMemo(() => {
    return datasetRows.map((row) => ({
      fecha: row.consultDate.toLocaleDateString("es-BO"),
      paciente: row.patientName,
      edadMeses: row.ageMonths,
      pesoKg: row.weightKg,
      tallaCm: row.heightCm,
      zScore: row.zScore !== null ? Number(row.zScore.toFixed(2)) : null,
      diagnostico: row.diagnosisLabel,
      pesoEdad: getStatusText(row.indicatorStatus.weightForAge),
      tallaEdad: getStatusText(row.indicatorStatus.heightForAge),
      pesoTalla: getStatusText(row.indicatorStatus.weightForHeight),
      lactancia: row.breastfeedingStatus ?? "Sin dato",
    }));
  }, [datasetRows]);

  const handleExportSpecializedReport = () => {
    const today = new Date();
    const dateStamp = today.toISOString().slice(0, 10);

    const zScoreRows = [
      ["Banda Z-score", "Casos", "Porcentaje"],
      ...zScoreDistribution.entries.map((entry) => [
        entry.label,
        entry.count,
        `${percentage(entry.count, zScoreDistribution.total)}%`,
      ]),
    ];

    const topDiagnosisRows = [
      ["Diagnostico", "Casos"],
      ...topDiagnoses.map((item) => [item.label, item.count]),
    ];

    const prevalenceRows = [
      ["Indicador", "Deficit severo", "Riesgo", "Normal", "Alto", "Total"],
      [
        "Peso/Edad",
        prevalenceWeightForAge.severeLow,
        prevalenceWeightForAge.riskLow,
        prevalenceWeightForAge.normal,
        prevalenceWeightForAge.high,
        prevalenceWeightForAge.total,
      ],
      [
        "Talla/Edad",
        prevalenceHeightForAge.severeLow,
        prevalenceHeightForAge.riskLow,
        prevalenceHeightForAge.normal,
        prevalenceHeightForAge.high,
        prevalenceHeightForAge.total,
      ],
      [
        "Peso/Talla",
        prevalenceWeightForHeight.severeLow,
        prevalenceWeightForHeight.riskLow,
        prevalenceWeightForHeight.normal,
        prevalenceWeightForHeight.high,
        prevalenceWeightForHeight.total,
      ],
    ];

    const summaryRows = [
      ["Campo", "Valor"],
      ["Formato", "REPORTE_NUTRICIONAL_PEDIATRICO_MINISTERIAL"],
      ["Fecha de generacion", today.toLocaleString("es-BO")],
      ["Total consultas analizadas", datasetRows.length],
      [
        "Prevalencia deficit peso/edad (%)",
        `${percentage(
          prevalenceWeightForAge.severeLow + prevalenceWeightForAge.riskLow,
          prevalenceWeightForAge.total
        )}%`,
      ],
      [
        "Prevalencia deficit talla/edad (%)",
        `${percentage(
          prevalenceHeightForAge.severeLow + prevalenceHeightForAge.riskLow,
          prevalenceHeightForAge.total
        )}%`,
      ],
      [
        "Prevalencia deficit peso/talla (%)",
        `${percentage(
          prevalenceWeightForHeight.severeLow + prevalenceWeightForHeight.riskLow,
          prevalenceWeightForHeight.total
        )}%`,
      ],
      ["Ninos 6-24 meses evaluados", lactationReport.totalChildren6To24Months],
      ["Ninos 6-24 meses con lactancia", lactationReport.maintainedBreastfeeding],
      ["Cobertura de lactancia 6-24 meses (%)", `${lactationReport.maintainedPercent}%`],
    ];

    const detailRows = [
      [
        "Fecha",
        "Paciente",
        "Edad_meses",
        "Peso_kg",
        "Talla_cm",
        "Z_score",
        "Diagnostico",
        "Peso_Edad",
        "Talla_Edad",
        "Peso_Talla",
        "Lactancia",
      ],
      ...exportRows.map((row) => [
        row.fecha,
        row.paciente,
        row.edadMeses,
        row.pesoKg,
        row.tallaCm,
        row.zScore,
        row.diagnostico,
        row.pesoEdad,
        row.tallaEdad,
        row.pesoTalla,
        row.lactancia,
      ]),
    ];

    const workbookXml = buildSpreadsheetXml([
      { name: "Resumen", rows: summaryRows },
      { name: "Prevalencia", rows: prevalenceRows },
      { name: "Distribucion_Z", rows: zScoreRows },
      { name: "Top_Diagnosticos", rows: topDiagnosisRows },
      { name: "Detalle", rows: detailRows },
    ]);

    const blob = new Blob([`\uFEFF${workbookXml}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `reporte_nutricional_ministerio_${dateStamp}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-nutri-dark-grey">
            Analisis clinico y poblacional
          </h2>
          <p className="text-sm text-nutri-dark-grey/80">
            Indicadores OMS para vigilancia nutricional de la poblacion pediatrica atendida.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          className="px-5 py-2.5 text-sm font-bold"
          onClick={handleExportSpecializedReport}
          disabled={datasetRows.length === 0}
        >
          <Download size={16} />
          Exportacion especializada
        </Button>
      </div>

      {datasetRows.length === 0 ? (
        <div className="rounded-xl border border-nutri-light-grey bg-nutri-white px-4 py-5 text-sm text-nutri-dark-grey shadow-sm">
          No hay consultas suficientes para generar indicadores poblacionales.
        </div>
      ) : (
        <>
          <section className="space-y-3 rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
            <header className="flex items-center gap-2">
              <LineChart size={18} className="text-nutri-primary" />
              <h3 className="text-base font-semibold text-nutri-primary">Prevalencia de malnutricion</h3>
            </header>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <IndicatorBarCard
                title="Peso para la edad"
                subtitle="Indicador de desnutricion global y exceso ponderal."
                summary={prevalenceWeightForAge}
              />
              <IndicatorBarCard
                title="Talla para la edad"
                subtitle="Indicador de desnutricion cronica (retardo de crecimiento)."
                summary={prevalenceHeightForAge}
              />
              <IndicatorBarCard
                title="Peso para la talla"
                subtitle="Indicador de desnutricion aguda y sobrepeso."
                summary={prevalenceWeightForHeight}
              />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
            <header className="flex items-center gap-2">
              <FileBarChart2 size={18} className="text-nutri-primary" />
              <h3 className="text-base font-semibold text-nutri-primary">Distribucion por Z-score</h3>
            </header>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {zScoreDistribution.entries.map((entry) => (
                <article
                  key={entry.label}
                  className="rounded-lg border border-nutri-light-grey bg-nutri-off-white/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-nutri-dark-grey">{entry.label}</p>
                    <p className="text-sm font-semibold text-nutri-primary">{entry.count}</p>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-nutri-light-grey">
                    <div
                      className="h-2 rounded-full bg-nutri-primary"
                      style={{
                        width: `${(entry.count / zScoreDistribution.highestCount) * 100}%`,
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <p className="text-xs text-nutri-dark-grey/80">
              Casos con Z-score disponible: {zScoreDistribution.total}
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
              <h3 className="text-base font-semibold text-nutri-primary">Top de diagnosticos frecuentes</h3>
              {topDiagnoses.length === 0 ? (
                <p className="mt-3 text-sm text-nutri-dark-grey">
                  No hay diagnosticos suficientes para construir el ranking.
                </p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {topDiagnoses.map((item, index) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-nutri-light-grey bg-nutri-off-white/60 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-nutri-dark-grey">
                        {index + 1}. {item.label}
                      </span>
                      <span className="font-semibold text-nutri-primary">{item.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </article>

            <article className="rounded-xl border border-nutri-light-grey bg-nutri-white p-4 shadow-sm sm:p-5">
              <header className="flex items-center gap-2">
                <Heart size={18} className="text-nutri-primary" />
                <h3 className="text-base font-semibold text-nutri-primary">Reporte de lactancia (6-24 meses)</h3>
              </header>
              <p className="mt-3 text-sm text-nutri-dark-grey">
                Ninos evaluados en rango 6-24 meses:{" "}
                <span className="font-semibold">{lactationReport.totalChildren6To24Months}</span>
              </p>
              <p className="mt-1 text-sm text-nutri-dark-grey">
                Mantienen lactancia materna:{" "}
                <span className="font-semibold">{lactationReport.maintainedBreastfeeding}</span>
              </p>
              <p className="mt-1 text-sm text-nutri-dark-grey">
                Cobertura estimada:{" "}
                <span className="font-semibold">{lactationReport.maintainedPercent}%</span>
              </p>
              <p className="mt-3 text-xs text-nutri-dark-grey/80">
                Este indicador usa el ultimo registro de cada nino en rango etareo para monitoreo local.
              </p>
            </article>
          </section>
        </>
      )}
    </div>
  );
};
