import { auth } from "../../../utils/auth";
import { apiService } from "../../../utils/apiService";
import { navigate } from "../../../utils/navigate";
import type { Pedido } from "../../../types/pedido";

let todosLosPedidos: Pedido[] = [];
let todosLosUsuarios: any[] = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!auth.verificarPermisos("ADMIN")) {
    alert("Acceso denegado.");
    navigate.toLogin();
    return;
  }

  const contenedor = document.getElementById("contenedor-pedidos-admin") as HTMLElement;
  const filtroSelect = document.getElementById("filtro-estado") as HTMLSelectElement;
  const modal = document.getElementById("modal-pedido-admin") as HTMLDivElement;
  const modalTitulo = document.getElementById("admin-modal-titulo") as HTMLElement;
  const modalContenido = document.getElementById("admin-modal-contenido") as HTMLElement;
  const btnCerrar = document.getElementById("btn-cerrar-admin-modal") as HTMLButtonElement;

  try {
    // cargar desde localstorage primero para mantener los cambios de estado
    const pedidosLocales = localStorage.getItem("historico_pedidos");
    if (pedidosLocales) {
      todosLosPedidos = JSON.parse(pedidosLocales);
    } else {
      const pedidosJson = await apiService.getPedidos();
      todosLosPedidos = pedidosJson;
      localStorage.setItem("historico_pedidos", JSON.stringify(todosLosPedidos));
    }

    const usuariosJson = await apiService.getUsuarios();
    const usuariosLocales = JSON.parse(localStorage.getItem("usuarios_registrados") || "[]");
    todosLosUsuarios = [...usuariosJson, ...usuariosLocales];

    todosLosPedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    renderizarPedidos("TODOS");

  } catch (error) {
    console.error("Error al cargar pedidos admin:", error);
  }

  filtroSelect.addEventListener("change", () => {
    renderizarPedidos(filtroSelect.value);
  });

  function renderizarPedidos(estadoFiltro: string) {
    contenedor.innerHTML = "";

    const filtrados = todosLosPedidos.filter(p => {
      if (p.eliminado) return false;
      if (estadoFiltro === "TODOS") return true;
      return p.estado === estadoFiltro;
    });

    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No hay pedidos con este estado.</p>";
      return;
    }

    filtrados.forEach((p: Pedido) => {
      const cliente = todosLosUsuarios.find(u => u.id === p.usuarioDto.id);
      const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente Invitado";
      const cantProductos = p.detalles.reduce((acc, d) => acc + d.cantidad, 0);

      const tarjeta = document.createElement("div");
      tarjeta.style.background = "white";
      tarjeta.style.padding = "15px";
      tarjeta.style.borderRadius = "8px";
      tarjeta.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
      tarjeta.style.cursor = "pointer";
      tarjeta.style.display = "flex";
      tarjeta.style.justifyContent = "space-between";
      tarjeta.style.alignItems = "center";

      tarjeta.innerHTML = `
        <div>
          <h4 style="margin: 0;">Pedido #${p.id} - Cliente: ${nombreCliente}</h4>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Fecha: ${p.fecha} | Items: ${cantProductos}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #2e7d32;">Total: $${p.total.toFixed(2)}</p>
        </div>
        <div>
          <span style="font-size: 12px; font-weight: bold; background: #eee; padding: 4px 8px; border-radius: 4px;">${p.estado}</span>
        </div>
      `;

      // click abre el modal interactivo
      tarjeta.addEventListener("click", () => {
        modalTitulo.textContent = `Modificar Orden #${p.id}`;
        
        let renglonesHtml = "";
        p.detalles.forEach(d => {
          renglonesHtml += `<li>Item ID: ${d.idProducto} - Cantidad: ${d.cantidad} (Subtotal: $${d.subtotal.toFixed(2)})</li>`;
        });

        // --- SELECTOR PARA CAMBIAR ESTADO (PUNTO 17) ---
        modalContenido.innerHTML = `
          <p><strong>Comprador:</strong> ${nombreCliente}</p>
          <p><strong>Fecha:</strong> ${p.fecha}</p>
          <p><strong>Método de pago:</strong> ${p.formaPago}</p>
          <p><strong>Lista de Productos:</strong></p>
          <ul>${renglonesHtml}</ul>
          <h4 style="color: #ff5722;">Total: $${p.total.toFixed(2)}</h4>
          <hr style="margin: 15px 0;">
          
          <label style="font-weight: bold;">Cambiar Estado del Pedido:</label><br>
          <select id="cambiar-estado-pedido" style="width: 100%; padding: 8px; margin-top: 5px;">
            <option value="PENDIENTE" ${p.estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
            <option value="CONFIRMADO" ${p.estado === 'CONFIRMADO' ? 'selected' : ''}>Confirmado</option>
            <option value="TERMINADO" ${p.estado === 'TERMINADO' ? 'selected' : ''}>Terminado</option>
            <option value="CANCELADO" ${p.estado === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
          </select>
          <button id="btn-guardar-estado" style="width: 100%; background: #4caf50; margin-top: 10px; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Guardar Nuevo Estado
          </button>
        `;

        modal.style.display = "flex";

        // --- GUARDAR CAMBIOS EN LOCALSTORAGE (PUNTO 18) ---
        const btnGuardar = document.getElementById("btn-guardar-estado") as HTMLButtonElement;
        const selectEstado = document.getElementById("cambiar-estado-pedido") as HTMLSelectElement;

        btnGuardar.addEventListener("click", () => {
          p.estado = selectEstado.value as any; // actualizar en caliente el objeto
          
          // persistir la lista entera actualizada
          localStorage.setItem("historico_pedidos", JSON.stringify(todosLosPedidos));
          
          modal.style.display = "none";
          alert(`Pedido #${p.id} actualizado a ${p.estado}`);
          
          // refrescar la lista de tarjetas usando el filtro actual
          renderizarPedidos(filtroSelect.value);
        });
      });

      contenedor.appendChild(tarjeta);
    });
  }

  btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });
});