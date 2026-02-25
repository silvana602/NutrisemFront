type Range = {
  min: number;
  max: number;
};

type BloodPressureRange = {
  ageGroup: string;
  systolic: Range;
  diastolic: Range;
};

type PediatricVitalBucket = {
  fromMonths: number;
  toMonths: number;
  temperature: Range;
  heartRate: Range;
  respiratoryRate: Range;
};

type PediatricVitalRanges = {
  temperature: Range;
  heartRate: Range;
  respiratoryRate: Range;
};

type BloodPressureBucket = {
  fromMonths: number;
  toMonths: number;
  ageGroup: string;
  systolic: Range;
  diastolic: Range;
};

const PEDIATRIC_VITAL_BUCKETS: readonly PediatricVitalBucket[] = [
  {
    fromMonths: 6,
    toMonths: 11,
    temperature: { min: 35.0, max: 40.5 },
    heartRate: { min: 100, max: 180 },
    respiratoryRate: { min: 30, max: 53 },
  },
  {
    fromMonths: 12,
    toMonths: 23,
    temperature: { min: 35.0, max: 40.5 },
    heartRate: { min: 90, max: 170 },
    respiratoryRate: { min: 24, max: 40 },
  },
  {
    fromMonths: 24,
    toMonths: 35,
    temperature: { min: 35.0, max: 40.2 },
    heartRate: { min: 80, max: 140 },
    respiratoryRate: { min: 22, max: 34 },
  },
  {
    fromMonths: 36,
    toMonths: 47,
    temperature: { min: 35.0, max: 40.2 },
    heartRate: { min: 75, max: 130 },
    respiratoryRate: { min: 20, max: 30 },
  },
  {
    fromMonths: 48,
    toMonths: 60,
    temperature: { min: 35.0, max: 40.0 },
    heartRate: { min: 70, max: 125 },
    respiratoryRate: { min: 18, max: 28 },
  },
];

const DEFAULT_VITAL_RANGES: PediatricVitalRanges = {
  temperature: { min: 35.0, max: 40.5 },
  heartRate: { min: 70, max: 190 },
  respiratoryRate: { min: 18, max: 60 },
};

const BLOOD_PRESSURE_BUCKETS: readonly BloodPressureBucket[] = [
  {
    fromMonths: 0,
    toMonths: 0,
    ageGroup: "Recien nacido (0-28 dias)",
    systolic: { min: 60, max: 90 },
    diastolic: { min: 20, max: 60 },
  },
  {
    fromMonths: 1,
    toMonths: 12,
    ageGroup: "Lactante (1-12 meses)",
    systolic: { min: 87, max: 105 },
    diastolic: { min: 53, max: 66 },
  },
  {
    fromMonths: 13,
    toMonths: 71,
    ageGroup: "Niño pequeno (1-5 años)",
    systolic: { min: 95, max: 110 },
    diastolic: { min: 53, max: 73 },
  },
  {
    fromMonths: 72,
    toMonths: 144,
    ageGroup: "Escolar (6-12 años)",
    systolic: { min: 97, max: 120 },
    diastolic: { min: 57, max: 80 },
  },
  {
    fromMonths: 145,
    toMonths: 216,
    ageGroup: "Adolescente (13-18 años)",
    systolic: { min: 110, max: 131 },
    diastolic: { min: 64, max: 83 },
  },
];

const DEFAULT_BLOOD_PRESSURE_RANGE: BloodPressureRange = {
  ageGroup: "Referencia general",
  systolic: { min: 60, max: 131 },
  diastolic: { min: 20, max: 83 },
};

export function getPediatricVitalRanges(ageMonths: number | null): PediatricVitalRanges {
  if (ageMonths === null) return DEFAULT_VITAL_RANGES;

  const bucket = PEDIATRIC_VITAL_BUCKETS.find(
    (item) => ageMonths >= item.fromMonths && ageMonths <= item.toMonths
  );

  if (!bucket) return DEFAULT_VITAL_RANGES;

  return {
    temperature: bucket.temperature,
    heartRate: bucket.heartRate,
    respiratoryRate: bucket.respiratoryRate,
  };
}

export function getBloodPressureRangeByAgeMonths(
  ageMonths: number | null
): BloodPressureRange {
  if (ageMonths === null) return DEFAULT_BLOOD_PRESSURE_RANGE;

  const bucket = BLOOD_PRESSURE_BUCKETS.find(
    (item) => ageMonths >= item.fromMonths && ageMonths <= item.toMonths
  );

  if (!bucket) return DEFAULT_BLOOD_PRESSURE_RANGE;

  return {
    ageGroup: bucket.ageGroup,
    systolic: bucket.systolic,
    diastolic: bucket.diastolic,
  };
}
