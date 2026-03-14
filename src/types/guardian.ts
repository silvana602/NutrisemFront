import type { ResidenceAddress } from "./residence";

export type Guardian = {
  guardianId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  address: string;
  residenceAddress?: ResidenceAddress;
  phone: string;
  relationship: string; // mother, father, legal guardian
  password: string;
};
