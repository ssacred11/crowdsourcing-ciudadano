export type Role = 'admin' | 'profesor' | 'encargado' | 'alumno';

export const ROLE_LABEL: Record<Role,string> = {
  admin: 'Administrador',
  profesor: 'Profesor',
  encargado: 'Encargado Infraestructura',
  alumno: 'Alumno',
};

export const CAN = {
  VIEW_ALL_REPORTS: ['admin', 'profesor', 'encargado', 'alumno'] as Role[],
  EDIT_ACADEMIC_REPORT: ['admin', 'profesor'] as Role[],
  EDIT_INFRA_REPORT: ['admin', 'encargado'] as Role[],
  MANAGE_USERS: ['admin'] as Role[],
};
