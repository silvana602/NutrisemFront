// Antecedentes de una consulta
export type Antecedent = {
    antecedentId: string;  // idAntecedentes
    consultationId: string;
    breastfeeding: string;       // lactancia
    bottles: string;             // biberones
    feedingFrequency: string;    //frecuencia_alimentaria
    complementaryStart: string;  // inicio_alim_complementaria
    foodsConsumed: string;       // alimentos_consumidos
    dailyAmount: string;         // cantidad_alimentos_dia
    recentIllnesses: string;     // enfermedades_recientes
    vaccination: string;         // vacunacion
    averageSleep: string;        // promedio_sueno
    sleepRoutine: string;        // rutina_sueño
    observations: string;
};