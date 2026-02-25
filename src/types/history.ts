export interface History {
  historyId: string;
  patientId: string;
  creationDate: Date;
  consultationId?: string;
  clinicianId?: string;
  summary?: string;
}
