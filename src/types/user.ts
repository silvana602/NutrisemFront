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
  email?: string;
  phone: string;
  address: string;
  profilePhoto?: string | null;
  role: UserRole;
  password: string;
}
