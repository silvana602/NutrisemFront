export interface Consultation {
  consultationId: string;
  patientId: string;
  clinicianId: string;
  date: Date;
  time: string; // HH:mm:ss
}
