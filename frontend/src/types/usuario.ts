export type Usuario = {
  id: number;
  eliminado: boolean;
  nombre: string;
  apellido: string;
  mail: string;
  celular?: string;
  rol: 'ADMIN' | 'USUARIO';
};