import type { Product } from "./product";
import type { Usuario } from "./usuario";

export type DetallePedidoJSON = {
  idProducto: number;
  cantidad: number;
  subtotal: number;
};

export type Pedido = {
  id: number;
  eliminado: boolean;
  fecha: string; // Formato YYYY-MM-DD
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'TERMINADO' | 'CANCELADO';
  total: number;
  formaPago: 'TARJETA' | 'TRANSFERENCIA' | 'EFECTIVO'; // Enums del back en java
  usuarioDto: Usuario;
  detalles: DetallePedidoJSON[];
};


export type ItemCarrito = {
  producto: Product;
  cantidad: number;
};