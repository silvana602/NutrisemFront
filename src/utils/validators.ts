// src/utils/validators.ts

/**
 * Valida campos obligatorios.
 */
export const validateRequired = (value: string, fieldName: string) => {
    if (!value || value.trim() === "") {
        return `${fieldName} es obligatorio`;
    }
    return null;
};

/**
 * Valida nombre o apellido: solo letras, espacios y mínimo 2 caracteres.
 */
export const validateName = (value: string) => {
    if (!value) return "El nombre es obligatorio";

    const regex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{2,}$/;

    if (!regex.test(value)) {
        return "El nombre solo debe contener letras y tener al menos 2 caracteres";
    }

    return null;
};

/**
 * Valida correo electrónico estándar.
 */
export const validateEmail = (email: string) => {
    if (!email) return "El correo es obligatorio";

    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

    if (!regex.test(email)) {
        return "Correo electrónico inválido";
    }

    return null;
};

/**
 * Valida número de teléfono (Bolivia + internacional).
 */
export const validatePhone = (phone: string) => {
    if (!phone) return "El teléfono es obligatorio";

    const regex = /^[0-9+()\-\s]{7,20}$/;

    if (!regex.test(phone)) {
        return "Número de teléfono inválido";
    }

    return null;
};

/**
 * Validación de contraseña fuerte
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 número
 */
export const validatePassword = (password: string) => {
    if (!password) return "La contraseña es obligatoria";

    if (password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
    }

    if (!/[A-Z]/.test(password)) {
        return "Debe contener al menos una letra mayúscula";
    }

    if (!/[0-9]/.test(password)) {
        return "Debe contener al menos un número";
    }

    return null;
};

/**
 * Valida que dos contraseñas coincidan.
 */
export const validatePasswordMatch = (password: string, confirm: string) => {
    if (password !== confirm) {
        return "Las contraseñas no coinciden";
    }
    return null;
};

/**
 * Valida formato de fecha YYYY-MM-DD.
 */
export const validateDate = (date: string) => {
    if (!date) return "La fecha es obligatoria";

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(date)) return "Formato de fecha inválido";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Fecha no válida";

    return null;
};

/**
 * Valida CI, DNI u otro identificador numérico.
 */
export const validateDocumentNumber = (ci: string) => {
    if (!ci) return "El número de documento es obligatorio";

    const regex = /^[A-Za-z0-9-]{4,20}$/;

    if (!regex.test(ci)) {
        return "Número de documento inválido";
    }

    return null;
};
