import { create } from 'zustand';

type Role = 'admin' | 'profesor' | 'encargado' | 'alumno';

interface AuthState {
  isAuth: boolean;
  nombre: string;
  role: Role;
  login: (data: { nombre: string; role: Role }) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuth: false,
  nombre: '',
  role: 'alumno',
  login: ({ nombre, role }) => set({ isAuth: true, nombre, role }),
  logout: () => {
    // si quieres, limpia el token:
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ isAuth: false, nombre: '', role: 'alumno' });
  },
}));
