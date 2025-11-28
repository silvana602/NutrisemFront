// src/services/user.service.ts

import { fetcher } from "@/utils/fetcher";
import type { User } from "@/types/user";

/**
 * Servicio de usuarios para manejar toda la comunicación con el backend.
 * Totalmente desacoplado del UI y listo para producción.
 */
class UserService {
    private baseUrl = "/api/users";

    /**
     * Obtener todos los usuarios (solo para roles con permiso).
     */
    async getAll(): Promise<User[]> {
        return await fetcher(`${this.baseUrl}`);
    }

    /**
     * Obtener los datos de un usuario por ID.
     */
    async getById(id: string): Promise<User> {
        return await fetcher(`${this.baseUrl}/${id}`);
    }

    /**
     * Crear un nuevo usuario (Admin o Monitor).
     */
    async create(data: Partial<User>): Promise<User> {
        return await fetcher(`${this.baseUrl}`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    /**
     * Actualizar un usuario existente.
     */
    async update(id: string, data: Partial<User>): Promise<User> {
        return await fetcher(`${this.baseUrl}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    /**
     * Eliminar un usuario.
     */
    async delete(id: string): Promise<{ message: string }> {
        return await fetcher(`${this.baseUrl}/${id}`, {
            method: "DELETE",
        });
    }

    /**
     * Buscar usuario por correo (útil para recuperación de contraseña).
     */
    async findByEmail(email: string): Promise<User | null> {
        return await fetcher(`${this.baseUrl}/email/${email}`);
    }
}

// Exportar una instancia lista para usar
export const userService = new UserService();
