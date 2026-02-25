import { printReportHtmlFromHiddenFrame } from "@/features/patient/shared/utils/patientReportPdf.utils";
import type { RestrictedFoodGroup } from "@/features/shared/nutrition";

import type { PatientRecommendationViewModel, RecommendedFoodRow } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "Sin fecha";
  return dateTimeFormatter.format(value);
}

function toSafeFileToken(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "SinDato";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSuggestedFoodsTable(rows: RecommendedFoodRow[]): string {
  if (rows.length === 0) {
    return `<p class="empty-note">No hay alimentos sugeridos registrados.</p>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Alimento</th>
          <th>Categoria</th>
          <th>Beneficios</th>
          <th>Porcion</th>
          <th>Frecuencia</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.foodName)}</td>
                <td>${escapeHtml(row.category)}</td>
                <td>${escapeHtml(row.benefits)}</td>
                <td>${escapeHtml(row.portion)}</td>
                <td>${escapeHtml(row.frequency)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderRestrictedGroups(groups: RestrictedFoodGroup[]): string {
  if (groups.length === 0) {
    return `<p class="empty-note">No hay prohibiciones registradas.</p>`;
  }

  return groups
    .map((group) => {
      const rowsMarkup =
        group.items.length === 0
          ? `<p class="empty-note">No hay elementos para este grupo.</p>`
          : `
              <table>
                <thead>
                  <tr>
                    <th>Alimento restringido</th>
                    <th>Sustituto saludable</th>
                  </tr>
                </thead>
                <tbody>
                  ${group.items
                    .map(
                      (item) => `
                        <tr>
                          <td>${escapeHtml(item.food)}</td>
                          <td>${escapeHtml(item.healthySubstitute)}</td>
                        </tr>
                      `
                    )
                    .join("")}
                </tbody>
              </table>
            `;

      return `
        <article class="group-card">
          <h3>${escapeHtml(group.title)}</h3>
          <p class="group-subtitle">${escapeHtml(group.subtitle)}</p>
          ${rowsMarkup}
        </article>
      `;
    })
    .join("");
}

function buildPatientRecommendationsReportHtml(params: {
  generatedAt: string;
  documentTitle: string;
  patient: PatientRecommendationViewModel;
}): string {
  const { generatedAt, documentTitle, patient } = params;

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
          h1, h2, h3, p { margin: 0; }
          h1 {
            font-size: 21px;
            color: #16354b;
            margin-bottom: 6px;
          }
          h2 {
            font-size: 15px;
            color: #194b66;
            margin-bottom: 8px;
          }
          h3 {
            font-size: 13px;
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
          .recommendation-box {
            border: 1px solid #e4eaef;
            border-radius: 8px;
            background: #f9fbfd;
            padding: 10px;
            color: #2f3a44;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #d8dde2;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
          }
          th {
            background: #eef3f7;
            color: #31404d;
            font-weight: 700;
          }
          td {
            background: #fff;
          }
          .group-card + .group-card {
            margin-top: 10px;
          }
          .group-subtitle {
            color: #5d6060;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .empty-note {
            color: #5d6060;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header-wrap">
          <div class="brand-wrap">
            <div class="brand-mark">N</div>
            <div>
              <p class="brand-title">NUTRISEM</p>
              <p class="brand-subtitle">Seguimiento nutricional pediátrico</p>
            </div>
          </div>
          <div>
            <p class="meta">Generado: ${escapeHtml(generatedAt)}</p>
          </div>
        </div>

        <h1>Informe de recomendaciones alimentarias</h1>
        <p class="meta">
          Paciente: ${escapeHtml(patient.patientName)} | Fecha de consulta: ${escapeHtml(
            patient.dateLabel
          )}
        </p>
        <p class="meta">Estado nutricional: ${escapeHtml(patient.nutritionalStatus)}</p>

        <section class="report-section">
          <h2>Última recomendación alimentaria nutricional</h2>
          <div class="recommendation-box">${escapeHtml(patient.dietaryRecommendation)}</div>
        </section>

        <section class="report-section">
          <h2>Alimentos sugeridos</h2>
          ${renderSuggestedFoodsTable(patient.suggestedFoods)}
        </section>

        <section class="report-section">
          <h2>Alimentos restringidos y sustitutos</h2>
          ${renderRestrictedGroups(patient.restrictedGroups)}
        </section>
      </body>
    </html>
  `;
}

export async function generatePatientRecommendationsPdf(params: {
  patient: PatientRecommendationViewModel;
}): Promise<void> {
  const { patient } = params;
  const generatedAt = formatDateTime(new Date());

  const documentTitle = `Recomendaciones_${toSafeFileToken(patient.patientName)}_${toSafeFileToken(
    patient.dateLabel
  )}`;

  const reportHtml = buildPatientRecommendationsReportHtml({
    generatedAt,
    documentTitle,
    patient,
  });

  await printReportHtmlFromHiddenFrame(reportHtml);
}
