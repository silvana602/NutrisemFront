export type Gender = "male" | "female";

export interface Patient {
  patientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  birthDate: Date;
  gender: Gender;
  address: string;
}
