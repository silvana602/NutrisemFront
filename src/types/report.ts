export type ReportFormat = "PDF" | "EXCEL";

export type Report = {
  reportId: string;
  userId: string;
  reportType: string;
  format: ReportFormat;
  analysisPeriod: string;
  generationDate: Date;
};
