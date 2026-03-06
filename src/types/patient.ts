export type Gender = "male" | "female";

export type Patient = {
  patientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  birthDate: Date;
  gender: Gender;
  address: string;
};
