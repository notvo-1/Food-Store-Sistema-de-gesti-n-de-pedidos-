import { apiService } from "../../../utils/apiService";
import { auth } from "../../../utils/auth";
import { storage } from "../../../utils/localStorage";
import type { Pedido } from "../../../types/pedido";
console.log("estoy primero  aca");

document.addEventListener("DOMContentLoaded", async () => {
  auth.renderizarInfoSesion();
  actualizarContador();

  const contenedor = document.getElementById("lista-pedidos-cliente") as HTMLElement;
  const modal = document.getElementById("modal-detalle-pedido") as HTMLDivElement;
  const modalTitulo = document.getElementById("modal-titulo-id") as HTMLElement;
  const modalContenido = document.getElementById("modal-contenido-info") as HTMLElement;
  const btnCerrar = document.getElementById("btn-cerrar-modal-pedido") as HTMLButtonElement;

  const usuario = storage.getUsuario();

  // frenar si no esta logueado
  if (!usuario) {
    contenedor.innerHTML = "<p>Tenés que iniciar sesión para ver tus pedidos.</p>";
    return;
  }

  // funcion para elegir el color del badge
  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "PENDIENTE": return "#ff9800"; // naranja
      case "CONFIRMADO": return "#2196f3"; // azul
      case "TERMINADO": return "#4caf50"; // verde
      case "CANCELADO": return "#f44336"; // rojo
      default: return "#888";
    }
  };

  try {
    // traer pedidos del json y sumarle los nuevos que guardamos en el carrito
    const pedidosJson = await apiService.getPedidos();
    const pedidosLocales = JSON.parse(localStorage.getItem("historico_pedidos") || "[]");
    const todosLosPedidos = [...pedidosJson, ...pedidosLocales];

    // filtrar los pedidos que corresponden a este usuario logueado
    const misPedidos = todosLosPedidos.filter((p: Pedido) => p.usuarioDto.id === usuario.id && !p.eliminado);

    // validar si no tiene nada comprado
    console.log("estoy aca");
    
    console.log(misPedidos);
    
    if (misPedidos.length === 0) {
      contenedor.innerHTML = "<p>Todavía no realizaste ningún pedido.</p>";
      return;
    }

    // renderizar las tarjetas de mis pedidos
    contenedor.innerHTML = "";
    misPedidos.forEach((p: Pedido) => {
      const tarjeta = document.createElement("div");
      tarjeta.style.background = "white";
      tarjeta.style.padding = "15px";
      tarjeta.style.borderRadius = "8px";
      tarjeta.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      tarjeta.style.cursor = "pointer";
      tarjeta.style.display = "flex";
      tarjeta.style.justifyContent = "space-between";
      tarjeta.style.alignItems = "center";

      const colorBadge = obtenerColorEstado(p.estado);

      tarjeta.innerHTML = `
        <div>
          <h4 style="margin: 0; color: #333;">Pedido #${p.id}</h4>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Fecha: ${p.fecha}</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: #2e7d32;">Total: $${p.total.toFixed(2)}</p>
        </div>
        <div>
          <span style="background: ${colorBadge}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
            ${p.estado}
          </span>
        </div>
      `;

      // evento para abrir el modal con el detalle completo al hacer clic
      tarjeta.addEventListener("click", () => {
        modalTitulo.textContent = `Detalle del Pedido #${p.id}`;
        
        // armar la lista de productos comprados para meter en el modal
        let textoProductos = "";
        p.detalles.forEach(d => {
          textoProductos += `<li>Producto ID: ${d.idProducto} - Cantidad: ${d.cantidad} (Subtotal: $${d.subtotal.toFixed(2)})</li>`;
        });

        modalContenido.innerHTML = `
          <p><strong>Fecha:</strong> ${p.fecha}</p>
          <p><strong>Estado del envío:</strong> <span style="color: ${colorBadge}; font-weight: bold;">${p.estado}</span></p>
          <p><strong>Forma de Pago elegida:</strong> ${p.formaPago}</p>
          <p><strong>Productos de la orden:</strong></p>
          <ul>${textoProductos}</ul>
          <h4 style="margin-top: 15px; color: #ff6347;">Total Abonado (con envío): $${p.total.toFixed(2)}</h4>
        `;
        
        modal.style.display = "flex";
      });

      contenedor.appendChild(tarjeta);
    });

  } catch (error) {
    console.error("Error al cargar el historial:", error);
  }

  // cerrar modal
  btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  function actualizarContador() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const total = carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0);
      contador.textContent = total.toString();
    }
  }
});