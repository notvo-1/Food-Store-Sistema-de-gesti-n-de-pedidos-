// metodos para consumir la data a manera de api

import type { ICategory } from "../types/category";
import type { Product } from "../types/product";
import type { Usuario } from "../types/usuario";
import type { Pedido } from "../types/pedido";

// Rutas data para simular la API
const URL_CATEGORIAS = '/data/categorias.json';
const URL_PRODUCTOS = '/data/productos.json';
const URL_USUARIOS = '/data/usuarios.json';
const URL_PEDIDOS = '/data/pedidos.json';

export const apiService = {
  // Categorias acticas
  async getCategorias(): Promise<ICategory[]> {
    const res = await fetch(URL_CATEGORIAS); 
    const datos: ICategory[] = await res.json();
    return datos.filter(c => !c.eliminado);
  },

  // productos activos y disponibles
  async getProductos(): Promise<Product[]> {
    const res = await fetch(URL_PRODUCTOS); 
    const datos: Product[] = await res.json();
    return datos.filter(p => !p.eliminado && p.disponible);
  },

  // usuarios
  async getUsuarios(): Promise<Usuario[]> {
    const res = await fetch(URL_USUARIOS); // [cite: 318]
    return await res.json();
  },

  // historial de pedidos
  async getPedidos(): Promise<Pedido[]> {
    const res = await fetch(URL_PEDIDOS); // [cite: 318]
    return await res.json();
  }
};