export type Gender = "MALE" | "FEMALE";

export interface Patient {
  patientId: string;
  userId: string; // User with role PATIENT
  firstName: string;
  lastName: string;
  identityNumber: string;
  birthDate: Date;
  gender: Gender;
  address: string;
}
