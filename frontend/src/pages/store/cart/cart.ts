// src/pages/store/cart/cart.ts
import type { ItemCarrito, Pedido, DetallePedidoJSON } from "../../../types/pedido";
import { auth } from "../../../utils/auth";
import { storage } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";

// Constante fija declarada en el modulo (Debe documentarse en el README)
const COSTO_ENVIO = 500.00;

const contenedorCarrito = document.getElementById("contenedor-carrito") as HTMLElement;
const totalElemento = document.getElementById("carrito-total") as HTMLElement;
const vaciarCarrito = document.getElementById("btn-borrarCarrito") as HTMLButtonElement;
const seccionCheckout = document.getElementById("seccion-checkout") as HTMLDivElement;
const formCheckout = document.getElementById("form-checkout") as HTMLFormElement;
const contadorElemento = document.getElementById("contador-carrito") as HTMLElement;

const actualizarContador = () => {
  if (contadorElemento) {
    const carrito: ItemCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contadorElemento.textContent = total.toString();
  }
};

const limpiarCarrito = () => {
  localStorage.removeItem("carrito");
  actualizarContador();
  mostrarCarrito();
};

// Listar y maquetar el comportamiento completo
const mostrarCarrito = () => {
  const carrito: ItemCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");

  if (carrito.length === 0) {
    // Mensaje de estado vacío con botón de regreso a la tienda (FHU-05)
    contenedorCarrito.innerHTML = `
      <p>El carrito está vacío</p>
      <button onclick="window.location.href='/src/pages/store/home/home.html'" style="background-color: #666; margin-top: 10px;">
          ← Volver a la Tienda
      </button>
    `; 
    totalElemento.innerHTML = `<h3>Total a pagar: $0.00</h3>`;
    seccionCheckout.style.display = "none";
    vaciarCarrito.style.display = "none";
    return;
  }

  seccionCheckout.style.display = "block";
  vaciarCarrito.style.display = "inline-block";
  let subtotalGeneral = 0;
  contenedorCarrito.innerHTML = ""; 

  carrito.forEach((item) => {
    const articulo = document.createElement("article");
    articulo.classList.add("articulo-destacado");

    const img = document.createElement("img");
    const titulo = document.createElement("h3");
    const descripcion = document.createElement("p");
    const infoPrecios = document.createElement("p");

    const btnMenos = document.createElement("button");
    const btnMas = document.createElement("button");
    const btnEliminar = document.createElement("button"); // Botón individual exigido
    const spanCantidad = document.createElement("span");

    btnMenos.textContent = "-";
    btnMas.textContent = "+";
    btnEliminar.textContent = "Eliminar Producto"; 
    btnEliminar.style.backgroundColor = "#d32f2f";
    btnEliminar.style.marginTop = "10px";

    spanCantidad.textContent = ` Cantidad: ${item.cantidad} `;

    // Sumar unidades controlando stock
    btnMas.addEventListener("click", () => {
      if (item.cantidad >= item.producto.stock) {
        alert(`Lo sentimos, no hay más stock disponible de ${item.producto.nombre}. (Máximo: ${item.producto.stock})`);
        return;
      }
      item.cantidad++;
      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarContador();
      mostrarCarrito();
    });

    // Restar unidades
    btnMenos.addEventListener("click", () => {
      item.cantidad--;
      if (item.cantidad <= 0) {
        const nuevoCarrito = carrito.filter((c) => c.producto.id !== item.producto.id);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      } else {
        localStorage.setItem("carrito", JSON.stringify(carrito));
      }
      actualizarContador();
      mostrarCarrito();
    });

    // Eliminar la línea completa directamente (Criterio de Aceptación)
    btnEliminar.addEventListener("click", () => {
      const nuevoCarrito = carrito.filter((c) => c.producto.id !== item.producto.id);
      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
      actualizarContador();
      mostrarCarrito();
    });

    let subtotalProducto = item.producto.precio * item.cantidad;
    subtotalGeneral += subtotalProducto;

    titulo.textContent = item.producto.nombre;
    descripcion.textContent = item.producto.descripcion;
    img.src = item.producto.imagen;
    
    // Mostramos precio unitario y subtotal acumulado por producto
    infoPrecios.innerHTML = `
      <span>Precio Unitario: $${item.producto.precio.toFixed(2)}</span><br>
      <strong>Subtotal: $${subtotalProducto.toFixed(2)}</strong>
    `; 

    articulo.appendChild(titulo);
    articulo.appendChild(img);
    articulo.appendChild(descripcion);
    articulo.appendChild(infoPrecios);
    articulo.appendChild(btnMenos);
    articulo.appendChild(spanCantidad);
    articulo.appendChild(btnMas);
    articulo.appendChild(btnEliminar);

    contenedorCarrito.appendChild(articulo);
  });

  // Renderizar el resumen desglosado con envío constante (FHU-05)
  const totalCalculado = subtotalGeneral + COSTO_ENVIO;
  totalElemento.innerHTML = `
    <p style="margin: 5px 0;">Subtotal Productos: $${subtotalGeneral.toFixed(2)}</p>
    <p style="margin: 5px 0;">Costo de Envío fijo: $${COSTO_ENVIO.toFixed(2)}</p>
    <h3 style="margin: 10px 0 0 0; color: #ff6347;">Total Final del Pedido: $${totalCalculado.toFixed(2)}</h3>
  `;
};

vaciarCarrito.addEventListener("click", limpiarCarrito);

// Checkout: Validación final de campos y guardado estructurado del Pedido (FHU-05)
formCheckout.addEventListener("submit", (e) => {
  e.preventDefault();

  const usuarioActivo = storage.getUsuario();
  
  if (!usuarioActivo) {
    alert("¡Tenés que iniciar sesión para poder comprar!");
    window.location.href = "../../auth/login/login.html";
    return;
  }

  const carritoActual: ItemCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
  const selectPago = document.getElementById("checkout-pago") as HTMLSelectElement;

  // Generamos la lista de líneas de detalle mapeadas
  const detallesMapeados: DetallePedidoJSON[] = carritoActual.map(item => ({
    idProducto: item.producto.id,
    cantidad: item.cantidad,
    subtotal: item.producto.precio * item.cantidad
  }));

  const subtotalNeto = carritoActual.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);

  // Construccion objeto
  const nuevoPedido: Pedido = {
    id: Date.now(), // ID incremental simulado
    eliminado: false,
    fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    estado: 'PENDIENTE',
    total: subtotalNeto + COSTO_ENVIO, 
    formaPago: selectPago.value as any,
    usuarioDto: usuarioActivo, // Fallback en caso de operar como invitado
    detalles: detallesMapeados
  }; 

  // Persistencia de la orden en el localStorage histórico general
  const historialPedidos = JSON.parse(localStorage.getItem("historico_pedidos") || "[]");
  historialPedidos.push(nuevoPedido);
  localStorage.setItem("historico_pedidos", JSON.stringify(historialPedidos)); 

  alert(`¡Gracias por tu compra! Tu orden de comida #${nuevoPedido.id} fue registrada con un total de $${nuevoPedido.total.toFixed(2)}.`);
  limpiarCarrito(); // Borrado limpio del carro tras la compra (Criterio 6)
  navigate.toPedidos();

});

actualizarContador();
mostrarCarrito();
auth.renderizarInfoSesion();