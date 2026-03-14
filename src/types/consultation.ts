import type { ResidenceLocation } from "./residence";

export type Consultation = {
  consultationId: string;
  patientId: string;
  clinicianId: string;
  date: Date;
  time: string; // HH:mm:ss
  location?: ResidenceLocation;
};
