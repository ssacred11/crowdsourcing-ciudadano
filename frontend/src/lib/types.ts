export type ReportType = 'academico' | 'infraestructura';
export type ReportStatus = 'recibido' | 'en_evaluacion' | 'asignado' | 'en_progreso' | 'resuelto';

export interface Report {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: ReportType;
  lugar: string;
  creadoPor: string;
  fechaCreacion: string;
  estado: ReportStatus;
  resuelto: boolean;
  respuestas: Array<{autor:string; texto?:string; fotoUrl?:string; fecha:string;}>;
}

export interface User {
  id: string;
  nombre: string;
  role: 'admin'|'profesor'|'encargado'|'alumno';
}
