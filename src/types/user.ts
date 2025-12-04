import { Clinician } from './clinician';
import { Patient } from './patient';

export type Role = "admin" | "clinician" | "patient";

export type User = {
    userId: string;       
    role: Role;
    firstName: string;    
    lastName: string;     
    identityCard: string;
    phone: string;
    address: string;
    password: string;  
    clinician?: Clinician;
    patient?: Patient;   
};
