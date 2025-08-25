import type { Report, User } from './types';

let reports: Report[] = [
  {
    id: 'r-1',
    titulo: 'Duda de matemáticas: límites',
    descripcion: 'No entiendo el ejercicio 5',
    tipo: 'academico',
    lugar: 'Sala 2B',
    creadoPor: 'Ana',
    fechaCreacion: new Date().toISOString(),
    estado: 'recibido',
    resuelto: false,
    respuestas: [],
  },
  {
    id: 'r-2',
    titulo: 'Luz quemada en pasillo',
    descripcion: 'Pasillo 3 sin iluminación',
    tipo: 'infraestructura',
    lugar: 'Pasillo 3',
    creadoPor: 'Luis',
    fechaCreacion: new Date().toISOString(),
    estado: 'en_evaluacion',
    resuelto: false,
    respuestas: [],
  },
];

let users: User[] = [
  { id: 'u-1', nombre: 'Sebastián', role: 'admin' },
  { id: 'u-2', nombre: 'Profe María', role: 'profesor' },
  { id: 'u-3', nombre: 'Carlos', role: 'encargado' },
  { id: 'u-4', nombre: 'Juanita', role: 'alumno' },
];

export const db = {
  getReports: () => reports,
  addReport: (r: Report) => { reports = [r, ...reports]; return r; },
  getReport: (id: string) => reports.find(r => r.id === id) || null,
  updateReport: (id: string, data: Partial<Report>) => {
    reports = reports.map(r => r.id === id ? { ...r, ...data } : r);
    return reports.find(r => r.id === id) || null;
  },
  addRespuesta: (id: string, resp: Report['respuestas'][number]) => {
    reports = reports.map(r => r.id === id ? { ...r, respuestas: [resp, ...r.respuestas] } : r);
    return reports.find(r => r.id === id) || null;
  },
  getUsers: () => users,
  updateUser: (id: string, data: Partial<User>) => {
    users = users.map(u => u.id === id ? { ...u, ...data } : u);
    return users.find(u => u.id === id) || null;
  },
};
