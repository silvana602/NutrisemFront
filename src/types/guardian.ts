export interface Guardian {
  guardianId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  identityNumber: string;
  address: string;
  phone: string;
  relationship: string; // mother, father, legal guardian
  password: string;
}
