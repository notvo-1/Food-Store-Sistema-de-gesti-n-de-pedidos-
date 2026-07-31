import { auth } from "../../../utils/auth";
import { storage } from "../../../utils/localStorage";
import { apiService } from "../../../utils/apiService";
import { navigate } from "../../../utils/navigate";

document.addEventListener("DOMContentLoaded", async () => {
  //Control de Seguridad Obligatorio
  const esAdminValido = auth.verificarPermisos("ADMIN");
  if (!esAdminValido) {
    alert("Acceso denegado: Se requieren credenciales de Administrador.");
    navigate.toHomeStore();
    return;
  }

  // Captura de elementos del DOM de estadísticas
  const catTxt = document.getElementById("stat-categorias") as HTMLElement;
  const prodTxt = document.getElementById("stat-productos") as HTMLElement;
  const dispTxt = document.getElementById("stat-disponibles") as HTMLElement;
  const pedTxt = document.getElementById("stat-pedidos") as HTMLElement;
  const logoutBtn = document.getElementById("btn-logout") as HTMLButtonElement;

  // cierre de sesion
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      storage.clearSesion();
      navigate.toLogin();
    });
  }

  try {
    // fetch concurrentes
    const categorias = await apiService.getCategorias();
    const productos = await apiService.getProductos(); // Trae activos de por sí
    const pedidos = await apiService.getPedidos();

    const productosDisponibles = productos.filter(p => p.disponible && p.stock > 0);

    // mostrar metricas
    if (catTxt) catTxt.textContent = categorias.length.toString();
    if (prodTxt) prodTxt.textContent = productos.length.toString();
    if (dispTxt) dispTxt.textContent = productosDisponibles.length.toString();
    if (pedTxt) pedTxt.textContent = pedidos.length.toString();

  } catch (error) {
    console.error("Error al procesar las métricas del dashboard:", error);
  }
});