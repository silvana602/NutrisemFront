// Tipo de Healthcare
export type Healthcare = {
    healthcareId: string;
    userId: string;          // Relación directa al usuario
    professionalId: string;  // matrícula profesional
    profession: string;      
    specialty: string;       
    residence: string;       
    institution: string;     
};
