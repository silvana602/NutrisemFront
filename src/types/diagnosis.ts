export interface Diagnosis {
  diagnosisId: string;
  consultationId: string;
  medicalHistoryId: string;
  bmi: number;
  zScorePercentile: number;
  nutritionalDiagnosis: string;
  diagnosisDetails: string;
}
