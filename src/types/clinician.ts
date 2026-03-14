import type { ResidenceAddress } from "./residence";

export type Clinician = {
  clinicianId: string;
  userId: string;
  professionalLicense: string;
  profession: string;
  specialty: string;
  residence: string;
  residenceAddress?: ResidenceAddress;
  institution: string;
};
