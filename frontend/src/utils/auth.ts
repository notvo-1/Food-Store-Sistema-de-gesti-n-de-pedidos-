import { apiService } from "./apiService";
import { storage } from "./localStorage";

export const auth = {
  // login
  async login(email: string, contrasenia: string): Promise<{ exito: boolean; mensaje: string; rol?: 'ADMIN' | 'USUARIO' }> {
    try {
      const usuarios = await apiService.getUsuarios();
      const usuariosLocales = JSON.parse(localStorage.getItem("usuarios_registrados") || "[]");
      const todosLosUsuarios = [...usuarios, ...usuariosLocales];
      
      
      // comparar email y pass
      const encontrado = todosLosUsuarios.find((u: any) => u.mail === email && u.password === contrasenia);      
      if (!encontrado) {
        return { exito: false, mensaje: "Email o contraseña incorrectos." };
      }
      
      // verificar si eliminado
      if (encontrado.eliminado) {
        return { exito: false, mensaje: "El usuario está dado de baja." };
      }

      // mapear sin password para resguardar
      const usuarioSesion = {
        id: encontrado.id,
        eliminado: encontrado.eliminado,
        nombre: encontrado.nombre,
        apellido: encontrado.apellido,
        mail: encontrado.mail,
        celular: encontrado.celular,
        rol: encontrado.rol
      };

      // save en localstorage
      storage.setUsuario(usuarioSesion);

      return { exito: true, mensaje: "¡Login exitoso!", rol: encontrado.rol };
    } catch (error) {
      return { exito: false, mensaje: "Error al conectar con el servidor." };
    }
  },

  // verificar permisos y accesos
  verificarPermisos(rolRequerido?: 'ADMIN' | 'USUARIO'): boolean {
    const usuario = storage.getUsuario();
    if (!usuario) return false;
    if (rolRequerido && usuario.rol !== rolRequerido) return false;
    return true;
  },

  renderizarInfoSesion(): void {
    const contenedor = document.getElementById("info-sesion");
    if (!contenedor) return;

    const linkLogin = document.querySelector('a[href*="login.html"]') as HTMLElement;
    const linkRegister = document.querySelector('a[href*="register.html"]') as HTMLElement;

    const usuario = storage.getUsuario();

    if (usuario) {
      // si esta logueado ocultamos iniciar sesion y registrarse
      if (linkLogin) linkLogin.style.display = "none";
      if (linkRegister) linkRegister.style.display = "none";
      
      // Si hay usuario logueado, mostramos su nombre y el botón de Salir
      contenedor.innerHTML = `
        <span style="color: #4caf50; font-weight: bold;">👤 Hola, ${usuario.nombre}</span>
        <button id="btn-logout-tienda" style="background-color: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; margin: 0;">
          Salir
        </button>
      `;

      // borrar el localStorage y mandar al login
      const btnLogout = document.getElementById("btn-logout-tienda");
      btnLogout?.addEventListener("click", () => {
        storage.clearSesion(); // Borra datos y carrito 
        window.location.href = "/src/pages/auth/login/login.html"; // Redirige 
      });
    } else {
      // Si no esta logueado recordamos que es un invitado
      contenedor.innerHTML = `<span style="color: #bbb; font-size: 14px;">Invitado</span>`;
    }
  }
};