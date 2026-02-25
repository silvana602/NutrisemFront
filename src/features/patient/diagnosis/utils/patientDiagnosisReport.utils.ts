import type { PatientDiagnosisHistoryRow, PatientDiagnosisViewModel } from "../types";
import {
  escapeHtml,
  formatDateTime,
  formatMetric,
  toSafeFileToken,
} from "./patientDiagnosisFormatting.utils";
import { buildGrowthChartSvgMarkup } from "./patientDiagnosisGrowth.utils";
import { printReportHtmlFromHiddenFrame } from "@/features/patient/shared/utils/patientReportPdf.utils";

type PatientReportFieldRow = {
  label: string;
  value: string;
};

type PatientReportChartAsset = {
  title: string;
  interpretation: string;
  svgMarkup: string;
  imageDataUrl?: string;
};

type BuildPatientDiagnosisReportHtmlParams = {
  generatedAt: string;
  documentTitle: string;
  patient: PatientDiagnosisViewModel;
  row: PatientDiagnosisHistoryRow;
  consultationRows: PatientReportFieldRow[];
  diagnosisRows: PatientReportFieldRow[];
  chartAsset: PatientReportChartAsset;
};

async function svgMarkupToPngDataUrl(
  svgMarkup: string,
  targetWidth = 1600,
  targetHeight = 980
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("No se pudo obtener el contexto 2D para convertir grafico."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, targetWidth, targetHeight);
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/png", 0.92));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error("No se pudo convertir el grafico a imagen."));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  });
}

function buildPatientDiagnosisReportHtml(params: BuildPatientDiagnosisReportHtmlParams): string {
  const { generatedAt, documentTitle, patient, row, consultationRows, diagnosisRows, chartAsset } =
    params;

  const renderRowsTable = (rows: PatientReportFieldRow[]) => {
    if (!rows.length) {
      return `<p class="empty-note">No hay datos para esta seccion.</p>`;
    }

    return `
      <table>
        <tbody>
          ${rows
            .map(
              (entry) => `
                <tr>
                  <th>${escapeHtml(entry.label)}</th>
                  <td>${escapeHtml(entry.value)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  const chartVisual = chartAsset.imageDataUrl
    ? `<img src="${chartAsset.imageDataUrl}" alt="${escapeHtml(chartAsset.title)}" class="chart-image" />`
    : chartAsset.svgMarkup;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentTitle)}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #27323c;
            background: #fff;
            line-height: 1.35;
            font-size: 12px;
          }
          h1, h2, h3, h4, p { margin: 0; }
          h1 {
            font-size: 21px;
            color: #16354b;
            margin-bottom: 5px;
          }
          h2 {
            font-size: 15px;
            color: #194b66;
            margin-bottom: 8px;
          }
          h4 {
            font-size: 12px;
            color: #1f2f3d;
            margin-bottom: 6px;
          }
          .header-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
          }
          .brand-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .brand-mark {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #194b66;
            color: #ffffff;
            font-size: 16px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .brand-title {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
            color: #16354b;
          }
          .brand-subtitle {
            font-size: 10px;
            color: #5d6060;
          }
          .meta {
            color: #5d6060;
            font-size: 11px;
            margin-bottom: 4px;
          }
          .report-section {
            border: 1px solid #d8dde2;
            border-radius: 10px;
            padding: 10px;
            margin-top: 10px;
            page-break-inside: avoid;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #d8dde2;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
          }
          th {
            width: 34%;
            background: #eef3f7;
            color: #31404d;
            font-weight: 700;
          }
          td {
            background: #fff;
          }
          .empty-note {
            color: #5d6060;
            font-size: 11px;
          }
          .chart-card {
            border: 1px solid #d8dde2;
            border-radius: 8px;
            padding: 8px;
            page-break-inside: avoid;
          }
          .chart-visual {
            border: 1px solid #e8edf1;
            border-radius: 6px;
            overflow: hidden;
            background: #fff;
          }
          .chart-image {
            display: block;
            width: 100%;
            height: auto;
          }
          .chart-interpretation {
            margin-top: 6px;
            font-size: 11px;
            color: #394652;
          }
        </style>
      </head>
      <body>
        <div class="header-wrap">
          <div class="brand-wrap">
            <div class="brand-mark">N</div>
            <div>
              <p class="brand-title">NUTRISEM</p>
              <p class="brand-subtitle">Seguimiento nutricional pediatrico</p>
            </div>
          </div>
          <div>
            <p class="meta">Consulta Nro. ${escapeHtml(row.consultationNumber)}</p>
            <p class="meta">Generado: ${escapeHtml(generatedAt)}</p>
          </div>
        </div>

        <h1>Informe de diagnostico pediatrico</h1>
        <p class="meta">
          Paciente: ${escapeHtml(patient.patientName)} | CI: ${escapeHtml(
            patient.patientIdentityNumber
          )} | Edad: ${escapeHtml(patient.patientAgeLabel)}
        </p>
        <p class="meta">
          Medico: ${escapeHtml(row.clinicianName)} | Fecha de consulta: ${escapeHtml(
            row.dateLabel
          )}
        </p>

        <section class="report-section">
          <h2>Resumen de consulta</h2>
          ${renderRowsTable(consultationRows)}
        </section>

        <section class="report-section">
          <h2>Resumen del diagnostico</h2>
          ${renderRowsTable(diagnosisRows)}
        </section>

        <section class="report-section">
          <h2>Grafico de posicion en curva de crecimiento</h2>
          <article class="chart-card">
            <h4>${escapeHtml(chartAsset.title)}</h4>
            <div class="chart-visual">${chartVisual}</div>
            <p class="chart-interpretation">${escapeHtml(chartAsset.interpretation)}</p>
          </article>
        </section>
      </body>
    </html>
  `;
}

export async function generatePatientDiagnosisReportPdf(params: {
  patient: PatientDiagnosisViewModel;
  row: PatientDiagnosisHistoryRow;
}): Promise<void> {
  const { patient, row } = params;
  const generatedAt = formatDateTime(new Date());

  const chartSvgMarkup = buildGrowthChartSvgMarkup(row.chart.title, row.chart.unit, row.chart.points);
  const chartAsset: PatientReportChartAsset = {
    title: row.chart.title,
    interpretation: row.chart.interpretation,
    svgMarkup: chartSvgMarkup,
  };

  try {
    chartAsset.imageDataUrl = await svgMarkupToPngDataUrl(chartSvgMarkup);
  } catch {
    // Keep svg fallback when conversion fails.
  }

  const consultationRows: PatientReportFieldRow[] = [
    { label: "Motivo de consulta", value: row.reason },
    { label: "Peso", value: formatMetric(row.vitals.weightKg, "kg") },
    { label: "Talla", value: formatMetric(row.vitals.heightM, "m") },
    { label: "Perimetro cefalico", value: formatMetric(row.vitals.headCircumferenceCm, "cm") },
  ];

  const diagnosisRows: PatientReportFieldRow[] = [
    { label: "Estado nutricional", value: row.nutritionalStatus },
    { label: "Conclusion del medico", value: row.diagnosisSummary },
    { label: "Recomendacion medica", value: row.medicalRecommendation },
    { label: "Recomendacion alimentaria", value: row.dietaryRecommendation },
  ];

  const documentTitle = `Informe_Consulta_${toSafeFileToken(row.consultationNumber)}_${toSafeFileToken(
    patient.patientName
  )}_${toSafeFileToken(row.dateKey)}`;

  const reportHtml = buildPatientDiagnosisReportHtml({
    generatedAt,
    documentTitle,
    patient,
    row,
    consultationRows,
    diagnosisRows,
    chartAsset,
  });

  await printReportHtmlFromHiddenFrame(reportHtml);
}
