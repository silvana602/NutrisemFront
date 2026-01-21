export enum UserRole {
  admin = "admin",
  clinician = "clinician",
  patient = "patient"
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
