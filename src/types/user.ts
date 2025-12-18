export enum UserRole {
  ADMIN = "ADMIN",
  CLINICIAN = "CLINICIAN",
  PATIENT = "PATIENT"
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  phone: string;
  address: string;
  role: UserRole;
  password: string;
}
