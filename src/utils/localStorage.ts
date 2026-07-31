import type { Usuario } from "../types/usuario";

const USER_KEY = "foodstore_user_session";
const CART_KEY = "foodstore_cart";

export const storage = {
  // Guardar sesion
  setUsuario(usuario: Usuario): void {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  // verificar el usuario de la sesion
  getUsuario(): Usuario | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // clear al salir de la sesion
  clearSesion(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CART_KEY); // Limpia carrito
  }
};