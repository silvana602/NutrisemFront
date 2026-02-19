export type PediatricGender = "male" | "female";

type WhoLmsPoint = {
  ageMonths: number;
  l: number;
  m: number;
  s: number;
};

const WHO_BMI_AGE_MIN_MONTHS = 6;
const WHO_BMI_AGE_MAX_MONTHS = 60;

// WHO Child Growth Standards (BMI-for-age, 0-5y), LMS parameters.
// Source tables used for 6-60 months:
// - Boys 0-2 years and 2-5 years (BMI-for-age)
// - Girls 0-2 years and 2-5 years (BMI-for-age)
// Values here are consolidated for ages 6 to 60 months.
const WHO_BMI_FOR_AGE_LMS_MALE_6_60: readonly WhoLmsPoint[] = [
  { ageMonths: 6, l: -0.1913, m: 17.3422, s: 0.08234 },
  { ageMonths: 7, l: -0.2385, m: 17.3288, s: 0.08183 },
  { ageMonths: 8, l: -0.2802, m: 17.2647, s: 0.0814 },
  { ageMonths: 9, l: -0.3176, m: 17.1662, s: 0.08102 },
  { ageMonths: 10, l: -0.3516, m: 17.0488, s: 0.08068 },
  { ageMonths: 11, l: -0.3828, m: 16.9239, s: 0.08037 },
  { ageMonths: 12, l: -0.4115, m: 16.7981, s: 0.08009 },
  { ageMonths: 13, l: -0.4382, m: 16.6743, s: 0.07982 },
  { ageMonths: 14, l: -0.463, m: 16.5548, s: 0.07958 },
  { ageMonths: 15, l: -0.4863, m: 16.4409, s: 0.07935 },
  { ageMonths: 16, l: -0.5082, m: 16.3335, s: 0.07913 },
  { ageMonths: 17, l: -0.5289, m: 16.2329, s: 0.07892 },
  { ageMonths: 18, l: -0.5484, m: 16.1392, s: 0.07873 },
  { ageMonths: 19, l: -0.5669, m: 16.0528, s: 0.07854 },
  { ageMonths: 20, l: -0.5846, m: 15.9743, s: 0.07836 },
  { ageMonths: 21, l: -0.6014, m: 15.9039, s: 0.07818 },
  { ageMonths: 22, l: -0.6174, m: 15.8412, s: 0.07802 },
  { ageMonths: 23, l: -0.6328, m: 15.7852, s: 0.07786 },
  { ageMonths: 24, l: -0.6187, m: 16.0189, s: 0.07785 },
  { ageMonths: 25, l: -0.584, m: 15.98, s: 0.07792 },
  { ageMonths: 26, l: -0.5497, m: 15.9414, s: 0.078 },
  { ageMonths: 27, l: -0.5166, m: 15.9036, s: 0.07808 },
  { ageMonths: 28, l: -0.485, m: 15.8667, s: 0.07818 },
  { ageMonths: 29, l: -0.4552, m: 15.8306, s: 0.07829 },
  { ageMonths: 30, l: -0.4274, m: 15.7953, s: 0.07841 },
  { ageMonths: 31, l: -0.4016, m: 15.7606, s: 0.07854 },
  { ageMonths: 32, l: -0.3782, m: 15.7267, s: 0.07867 },
  { ageMonths: 33, l: -0.3572, m: 15.6934, s: 0.07882 },
  { ageMonths: 34, l: -0.3388, m: 15.661, s: 0.07897 },
  { ageMonths: 35, l: -0.3231, m: 15.6294, s: 0.07914 },
  { ageMonths: 36, l: -0.3101, m: 15.5988, s: 0.07931 },
  { ageMonths: 37, l: -0.3, m: 15.5693, s: 0.0795 },
  { ageMonths: 38, l: -0.2927, m: 15.541, s: 0.07969 },
  { ageMonths: 39, l: -0.2884, m: 15.514, s: 0.0799 },
  { ageMonths: 40, l: -0.2869, m: 15.4885, s: 0.08012 },
  { ageMonths: 41, l: -0.2881, m: 15.4645, s: 0.08036 },
  { ageMonths: 42, l: -0.2919, m: 15.442, s: 0.08061 },
  { ageMonths: 43, l: -0.2981, m: 15.421, s: 0.08087 },
  { ageMonths: 44, l: -0.3067, m: 15.4013, s: 0.08115 },
  { ageMonths: 45, l: -0.3174, m: 15.3827, s: 0.08144 },
  { ageMonths: 46, l: -0.3303, m: 15.3652, s: 0.08174 },
  { ageMonths: 47, l: -0.3452, m: 15.3485, s: 0.08205 },
  { ageMonths: 48, l: -0.3622, m: 15.3326, s: 0.08238 },
  { ageMonths: 49, l: -0.3811, m: 15.3174, s: 0.08272 },
  { ageMonths: 50, l: -0.4019, m: 15.3029, s: 0.08307 },
  { ageMonths: 51, l: -0.4245, m: 15.2891, s: 0.08343 },
  { ageMonths: 52, l: -0.4488, m: 15.2759, s: 0.0838 },
  { ageMonths: 53, l: -0.4747, m: 15.2633, s: 0.08418 },
  { ageMonths: 54, l: -0.5019, m: 15.2514, s: 0.08457 },
  { ageMonths: 55, l: -0.5303, m: 15.24, s: 0.08496 },
  { ageMonths: 56, l: -0.5599, m: 15.2291, s: 0.08536 },
  { ageMonths: 57, l: -0.5905, m: 15.2188, s: 0.08577 },
  { ageMonths: 58, l: -0.6223, m: 15.2091, s: 0.08617 },
  { ageMonths: 59, l: -0.6552, m: 15.2, s: 0.08659 },
  { ageMonths: 60, l: -0.6892, m: 15.1916, s: 0.087 },
];

const WHO_BMI_FOR_AGE_LMS_FEMALE_6_60: readonly WhoLmsPoint[] = [
  { ageMonths: 6, l: -0.1429, m: 16.9083, s: 0.09036 },
  { ageMonths: 7, l: -0.1916, m: 16.902, s: 0.08984 },
  { ageMonths: 8, l: -0.2344, m: 16.8404, s: 0.08939 },
  { ageMonths: 9, l: -0.2725, m: 16.7406, s: 0.08898 },
  { ageMonths: 10, l: -0.3068, m: 16.6184, s: 0.08861 },
  { ageMonths: 11, l: -0.3381, m: 16.4875, s: 0.08828 },
  { ageMonths: 12, l: -0.3667, m: 16.3568, s: 0.08797 },
  { ageMonths: 13, l: -0.3932, m: 16.2311, s: 0.08768 },
  { ageMonths: 14, l: -0.4177, m: 16.1128, s: 0.08741 },
  { ageMonths: 15, l: -0.4407, m: 16.0028, s: 0.08716 },
  { ageMonths: 16, l: -0.4623, m: 15.9017, s: 0.08693 },
  { ageMonths: 17, l: -0.4825, m: 15.8096, s: 0.08671 },
  { ageMonths: 18, l: -0.5017, m: 15.7263, s: 0.0865 },
  { ageMonths: 19, l: -0.5199, m: 15.6517, s: 0.0863 },
  { ageMonths: 20, l: -0.5372, m: 15.5855, s: 0.08612 },
  { ageMonths: 21, l: -0.5537, m: 15.5278, s: 0.08594 },
  { ageMonths: 22, l: -0.5695, m: 15.4787, s: 0.08577 },
  { ageMonths: 23, l: -0.5846, m: 15.438, s: 0.0856 },
  { ageMonths: 24, l: -0.5684, m: 15.6881, s: 0.08454 },
  { ageMonths: 25, l: -0.5684, m: 15.659, s: 0.08452 },
  { ageMonths: 26, l: -0.5684, m: 15.6308, s: 0.08449 },
  { ageMonths: 27, l: -0.5684, m: 15.6037, s: 0.08446 },
  { ageMonths: 28, l: -0.5684, m: 15.5777, s: 0.08444 },
  { ageMonths: 29, l: -0.5684, m: 15.5523, s: 0.08443 },
  { ageMonths: 30, l: -0.5684, m: 15.5276, s: 0.08444 },
  { ageMonths: 31, l: -0.5684, m: 15.5034, s: 0.08448 },
  { ageMonths: 32, l: -0.5684, m: 15.4798, s: 0.08455 },
  { ageMonths: 33, l: -0.5684, m: 15.4572, s: 0.08467 },
  { ageMonths: 34, l: -0.5684, m: 15.4356, s: 0.08484 },
  { ageMonths: 35, l: -0.5684, m: 15.4155, s: 0.08506 },
  { ageMonths: 36, l: -0.5684, m: 15.3968, s: 0.08535 },
  { ageMonths: 37, l: -0.5684, m: 15.3796, s: 0.08569 },
  { ageMonths: 38, l: -0.5684, m: 15.3638, s: 0.08609 },
  { ageMonths: 39, l: -0.5684, m: 15.3493, s: 0.08654 },
  { ageMonths: 40, l: -0.5684, m: 15.3358, s: 0.08704 },
  { ageMonths: 41, l: -0.5684, m: 15.3233, s: 0.08757 },
  { ageMonths: 42, l: -0.5684, m: 15.3116, s: 0.08813 },
  { ageMonths: 43, l: -0.5684, m: 15.3007, s: 0.08872 },
  { ageMonths: 44, l: -0.5684, m: 15.2905, s: 0.08931 },
  { ageMonths: 45, l: -0.5684, m: 15.2814, s: 0.08991 },
  { ageMonths: 46, l: -0.5684, m: 15.2732, s: 0.09051 },
  { ageMonths: 47, l: -0.5684, m: 15.2661, s: 0.0911 },
  { ageMonths: 48, l: -0.5684, m: 15.2602, s: 0.09168 },
  { ageMonths: 49, l: -0.5684, m: 15.2556, s: 0.09227 },
  { ageMonths: 50, l: -0.5684, m: 15.2523, s: 0.09286 },
  { ageMonths: 51, l: -0.5684, m: 15.2503, s: 0.09345 },
  { ageMonths: 52, l: -0.5684, m: 15.2496, s: 0.09403 },
  { ageMonths: 53, l: -0.5684, m: 15.2502, s: 0.0946 },
  { ageMonths: 54, l: -0.5684, m: 15.2519, s: 0.09515 },
  { ageMonths: 55, l: -0.5684, m: 15.2544, s: 0.09568 },
  { ageMonths: 56, l: -0.5684, m: 15.2575, s: 0.09618 },
  { ageMonths: 57, l: -0.5684, m: 15.2612, s: 0.09665 },
  { ageMonths: 58, l: -0.5684, m: 15.2653, s: 0.09709 },
  { ageMonths: 59, l: -0.5684, m: 15.2698, s: 0.0975 },
  { ageMonths: 60, l: -0.5684, m: 15.2747, s: 0.09789 },
];

function erf(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const absolute = Math.abs(value);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * absolute);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-absolute * absolute);

  return sign * y;
}

function normalCdf(value: number): number {
  return 0.5 * (1 + erf(value / Math.sqrt(2)));
}

function interpolateLmsPoint(
  points: readonly WhoLmsPoint[],
  ageMonths: number
): WhoLmsPoint {
  if (ageMonths <= points[0].ageMonths) return points[0];
  if (ageMonths >= points[points.length - 1].ageMonths) {
    return points[points.length - 1];
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];

    if (ageMonths < start.ageMonths || ageMonths > end.ageMonths) continue;
    if (ageMonths === start.ageMonths) return start;
    if (ageMonths === end.ageMonths) return end;

    const ratio = (ageMonths - start.ageMonths) / (end.ageMonths - start.ageMonths);
    return {
      ageMonths,
      l: start.l + ratio * (end.l - start.l),
      m: start.m + ratio * (end.m - start.m),
      s: start.s + ratio * (end.s - start.s),
    };
  }

  return points[points.length - 1];
}

function zScoreFromLms(
  value: number,
  lms: WhoLmsPoint,
  applyWhoExtendedRule = true
): number {
  if (!Number.isFinite(value) || value <= 0) return Number.NaN;

  const { l, m, s } = lms;
  if (!Number.isFinite(l) || !Number.isFinite(m) || !Number.isFinite(s) || m <= 0 || s <= 0) {
    return Number.NaN;
  }

  const computeZ = (x: number) => {
    if (Math.abs(l) < 1e-12) {
      return Math.log(x / m) / s;
    }

    return (Math.pow(x / m, l) - 1) / (l * s);
  };

  const z = computeZ(value);
  if (!applyWhoExtendedRule || !Number.isFinite(z)) {
    return z;
  }

  if (z > 3) {
    const sd2Pos = m * Math.pow(1 + l * s * 2, 1 / l);
    const sd3Pos = m * Math.pow(1 + l * s * 3, 1 / l);
    const sd23Pos = sd3Pos - sd2Pos;
    if (Number.isFinite(sd23Pos) && sd23Pos > 0) {
      return 3 + (value - sd3Pos) / sd23Pos;
    }
  }

  if (z < -3) {
    const sd2Neg = m * Math.pow(1 + l * s * -2, 1 / l);
    const sd3Neg = m * Math.pow(1 + l * s * -3, 1 / l);
    const sd23Neg = sd2Neg - sd3Neg;
    if (Number.isFinite(sd23Neg) && sd23Neg > 0) {
      return -3 + (value - sd3Neg) / sd23Neg;
    }
  }

  return z;
}

export function calculatePediatricBmiZScoreAndPercentile(
  bmi: number,
  ageMonths: number,
  gender: PediatricGender
) {
  if (
    !Number.isFinite(bmi) ||
    !Number.isFinite(ageMonths) ||
    ageMonths < WHO_BMI_AGE_MIN_MONTHS ||
    ageMonths > WHO_BMI_AGE_MAX_MONTHS
  ) {
    return { zScore: Number.NaN, percentile: Number.NaN };
  }

  const lmsTable =
    gender === "female"
      ? WHO_BMI_FOR_AGE_LMS_FEMALE_6_60
      : WHO_BMI_FOR_AGE_LMS_MALE_6_60;

  const lmsPoint = interpolateLmsPoint(lmsTable, ageMonths);
  const rawZ = zScoreFromLms(bmi, lmsPoint, true);

  if (!Number.isFinite(rawZ)) {
    return { zScore: Number.NaN, percentile: Number.NaN };
  }

  const zScore = Number(rawZ.toFixed(2));
  const percentile = Math.max(1, Math.min(99, Math.round(normalCdf(rawZ) * 100)));

  return { zScore, percentile };
}
