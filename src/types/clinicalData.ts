export type ClinicalInformantType = "MADRE" | "PADRE" | "CUIDADOR" | "OTRO";

export type ClinicalPrematurityOption = "SI" | "NO" | "DESCONOCIDO";

export type ClinicalBilateralEdemaGrade = "0" | "+" | "++" | "+++";

type LegacyOrMultiValue = string | string[];

export interface ClinicalData {
  clinicalDataId: string;
  consultationId: string;

  // Datos generales
  ageYears?: number; // legado
  mainConsultationReason?: string;
  informantType?: ClinicalInformantType | string;
  informantName?: string;
  informantRelationship?: string;
  alarmSigns?: LegacyOrMultiValue;
  birthWeightKg?: number;
  gestationalAgeWeeks?: number;
  prematurity?: ClinicalPrematurityOption | string;
  activityLevel?: LegacyOrMultiValue;
  apathy?: LegacyOrMultiValue;
  generalObservations?: string;

  // Signos fisicos
  hairCondition?: LegacyOrMultiValue;
  skinCondition?: LegacyOrMultiValue;
  edema?: LegacyOrMultiValue;
  bilateralEdemaGrade?: ClinicalBilateralEdemaGrade | string;
  dentition?: LegacyOrMultiValue;
  physicalObservations?: string;

  // Sintomas digestivos
  diarrhea?: string;
  vomiting?: string;
  dehydration?: LegacyOrMultiValue;
  digestiveObservations?: string;

  // Signos vitales
  temperatureCelsius?: number;
  temperatureObservation?: string;
  heartRate?: number;
  heartRateObservation?: string;
  respiratoryRate?: number;
  respiratoryRateObservation?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressure?: string;
  bloodPressureObservation?: string;
  observations?: string;
}
