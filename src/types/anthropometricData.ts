// Datos Antropométricos de una consulta
export type AnthropometricData = {
    anthropometricDataId: string;   // idDAntropometricos
    consultationId: string;
    weight: number; // peso
    height: number; // talla
    muac: number;
    headCircumference: number; //perimetro_cefalico
};