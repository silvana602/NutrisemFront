// src/store/useUIStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Tipos de tema y notificaciones
type Theme = "light" | "dark";

interface Notification {
  message: string;
}

// Definición del estado y acciones de la UI
interface UIStore {
  // Estados
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalType: string | null;
  isLoading: boolean;
  notification: Notification | null;
  theme: Theme;

  // Acciones
  toggleSidebar: () => void;
  openModal: (type: string) => void;
  closeModal: () => void;
  setLoading: (value: boolean) => void;
  setTheme: (theme: Theme) => void;
}

// Creación del store
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Estados iniciales
      isSidebarOpen: false,
      isModalOpen: false,
      modalType: null,
      isLoading: false,
      notification: null,
      theme: "light",

      // Acciones
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      openModal: (type: string) => set({ isModalOpen: true, modalType: type }),
      closeModal: () => set({ isModalOpen: false, modalType: null }),
      setLoading: (value: boolean) => set({ isLoading: value }),
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: "ui-store", // nombre en localStorage
      partialize: (state) => ({ theme: state.theme }), // solo persistir tema
    }
  )
);
