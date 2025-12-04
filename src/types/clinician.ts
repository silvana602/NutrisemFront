// Tipo de clinician
export type Clinician = {
    clinicianId: string;
    userId: string;          // Relación directa al usuario
    professionalId: string;  // matrícula profesional
    profession: string;      
    specialty: string;       
    residence: string;       
    institution: string;     
};
