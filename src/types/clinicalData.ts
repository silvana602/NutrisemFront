// Datos clínicos de una consulta
export type ClinicalData = {
    clinicalDataId: string;   // idDClinicos
    consultationId: string;
    activity: string; // actividad
    mood: string;     // desanimo
    hair: string;     // cabello
    skin: string;     // piel
    edema: string;    // edemas
    dentition: string; // denticion
    diarrhea: string;
    vomit: string;    // vomitos
    dehydration: string; // deshidratacion
    temperature: string;
    heartRate: string; 
    respiratoryRate: string;
    bloodPressure: string; // presion_arterial
    observations: string; 
};