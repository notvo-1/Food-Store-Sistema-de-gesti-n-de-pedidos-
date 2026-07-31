import { apiService } from "../../../utils/apiService";
import { auth } from "../../../utils/auth";
import type { Product } from "../../../types/product";
import { navigate } from "../../../utils/navigate";

document.addEventListener("DOMContentLoaded", async () => {
  auth.renderizarInfoSesion();
  actualizarContador();

  // Obtener ID producto
  const params = new URLSearchParams(window.location.search);
  const productoId = parseInt(params.get("id") || "0");

  const btnVolver = document.getElementById("btn-volver") as HTMLButtonElement;
  const img = document.getElementById("prod-imagen") as HTMLImageElement;
  const nombreTxt = document.getElementById("prod-nombre") as HTMLElement;
  const descTxt = document.getElementById("prod-descripcion") as HTMLElement;
  const precioTxt = document.getElementById("prod-precio") as HTMLElement;
  const stockTxt = document.getElementById("prod-stock") as HTMLElement;
  const inputCantidad = document.getElementById("input-cantidad") as HTMLInputElement;
  const btnAgregar = document.getElementById("btn-agregar-detalle") as HTMLButtonElement;

  let productoActual: Product | null = null;

  //  volver al catalogo
  btnVolver.addEventListener("click", () => {
    window.location.href = "/src/pages/store/home/home.html";
  });

  try {
    // detch a productos y filtrado por ID
    const productos = await apiService.getProductos();
    const encontrado = productos.find(p => p.id === productoId);

    if (!encontrado) {
      nombreTxt.textContent = "Producto no encontrado";
      return;
    }

    productoActual = encontrado;

    // Renderizar campos del producto
    nombreTxt.textContent = productoActual.nombre;
    descTxt.textContent = productoActual.descripcion;
    precioTxt.textContent = `$${productoActual.precio.toFixed(2)}`;
    img.src = productoActual.imagen;

    // disponibilidad
    if (!productoActual.disponible || productoActual.stock === 0) {
      stockTxt.textContent = "Estado: No Disponible / Sin Stock";
      stockTxt.style.color = "red";
      btnAgregar.disabled = true;
      btnAgregar.style.backgroundColor = "#ccc";
      inputCantidad.disabled = true;
    } else {
      stockTxt.textContent = `Stock disponible: ${productoActual.stock} unidades`;
      stockTxt.style.color = "#2e7d32";
      inputCantidad.max = productoActual.stock.toString();
    }

  } catch (error) {
    console.error("Error al cargar el detalle del producto:", error);
  }

  //selector de cantidad y persistencia
  btnAgregar.addEventListener("click", () => {
    if (!productoActual) return;

    const cantidad = parseInt(inputCantidad.value);

    // Validacion stock
    if (cantidad <= 0 || cantidad > productoActual.stock) {
      alert(`Cantidad inválida. El stock máximo disponible es ${productoActual.stock} unidades.`);
      return;
    }

    const carritoActual = JSON.parse(localStorage.getItem("carrito") || "[]");
    const existe = carritoActual.find((item: any) => item.producto.id === productoActual!.id);

    if (existe) {
      if (existe.cantidad + cantidad > productoActual.stock) {
        alert(`No podés agregar esa cantidad. Ya tenés ${existe.cantidad} unidades en el carrito y el stock máximo es ${productoActual.stock}.`);
        return;
      }
      //@ts-ignore
      existe.cantidad += cantidad;
    } else {
      carritoActual.push({ producto: productoActual, cantidad: cantidad });
    }

    localStorage.setItem("carrito", JSON.stringify(carritoActual));
    actualizarContador();
    
    // confirmacion
    alert(`¡Éxito! Se agregaron ${cantidad} unidad(es) de "${productoActual.nombre}" al carrito.`);
    navigate.toHomeStore();
  })

  function actualizarContador() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const total = carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0);
      contador.textContent = total.toString();
    }
  }
});