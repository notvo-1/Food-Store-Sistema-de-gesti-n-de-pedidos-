import type { ICategory } from "./category";
export type Product = {
  id: number,
  eliminado: boolean,
  createdAt: string,
  nombre: string,
  precio: number,
  descripcion: string,
  stock: number,
  imagen: string,
  disponible: boolean,
  categoria: ICategory // no lo cambie tal cual el .json y se buggeo
};

