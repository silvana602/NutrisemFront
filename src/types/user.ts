// Tipo de Usuario
export type Role = "admin" | "healthcare" | "patient";

export type User = {
    userId: string;       
    role: Role;
    firstName: string;    
    lastName: string;     
    identityCard: string;
    phone: string;
    address: string;
    password: string;     
};
