import type { ItemCarrito } from "../../../types/pedido";
import { auth } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";

const contadorElemento = document.getElementById("contador-carrito") as HTMLElement;

const actualizarContador = () => {
  if (contadorElemento) {
    const carrito: ItemCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contadorElemento.textContent = total.toString();
  }
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm") as HTMLFormElement;
    const errorDiv = document.getElementById("errorMensaje") as HTMLDivElement;

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById("email") as HTMLInputElement;
        const passwordInput = document.getElementById("password") as HTMLInputElement;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Limpiamos mensajes previos
        errorDiv.style.display = "none";
        errorDiv.innerText = "";

        // Ejecutamos la validación contra el servicio auth
        const resultado = await auth.login(email, password);

        if (resultado.exito) {
            // Redirección condicionada según el rol asignado en el JSON
            if (resultado.rol === "ADMIN") {
                navigate.toAdminDashboard();
            } else {
                navigate.toHomeStore();
            }
        } else {
            // Mostrar error en pantalla ante credenciales incorrectas
            errorDiv.innerText = resultado.mensaje;
            errorDiv.style.display = "block";
        }
    });
});

actualizarContador();