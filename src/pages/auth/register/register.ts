import { apiService } from "../../../utils/apiService";
import { storage } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import type { Usuario } from "../../../types/usuario";
import type { ItemCarrito } from "../../../types/pedido";

const contadorElemento = document.getElementById("contador-carrito") as HTMLElement;

const actualizarContador = () => {
  if (contadorElemento) {
    const carrito: ItemCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contadorElemento.textContent = total.toString();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm") as HTMLFormElement;
  const errorDiv = document.getElementById("errorMensaje") as HTMLDivElement;

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById("nombre") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    errorDiv.style.display = "none";
    errorDiv.innerText = "";

    // validar largo de contraseña
    if (password.length < 6) {
      errorDiv.innerText = "Error: La contraseña debe tener al menos 6 caracteres.";
      errorDiv.style.display = "block";
      return;
    }

    try {
      // traer usuarios de la base y del localstorage para chequear el mail
      const usuariosJson = await apiService.getUsuarios();
      const usuariosLocales = JSON.parse(localStorage.getItem("usuarios_registrados") || "[]");
      const todosLosUsuarios = [...usuariosJson, ...usuariosLocales];

      const mailDuplicado = todosLosUsuarios.some(u => u.mail.toLowerCase() === email.toLowerCase());

      if (mailDuplicado) {
        errorDiv.innerText = "Error: El email ya se encuentra registrado.";
        errorDiv.style.display = "block";
        return;
      }

      // crear nuevo usuario para guardar
      const nuevoUsuario: Usuario = {
        id: Date.now(),
        eliminado: false,
        nombre: nombre,
        apellido: "", 
        mail: email,
        rol: "USUARIO"
      };

      // armar el objeto con la pass para que sirva en el login posterior
      const usuarioConPass = {
        ...nuevoUsuario,
        password: password
      };

      // guardar en la lista local de usuarios
      usuariosLocales.push(usuarioConPass);
      localStorage.setItem("usuarios_registrados", JSON.stringify(usuariosLocales));

      // iniciar la sesion actual del usuario
      storage.setUsuario(nuevoUsuario);
      
      alert("¡Registro completado con éxito! Iniciando sesión...");
      navigate.toHomeStore();

    } catch (error) {
      errorDiv.innerText = "Ocurrió un error al intentar procesar el registro.";
      errorDiv.style.display = "block";
    }
  });
});
actualizarContador();