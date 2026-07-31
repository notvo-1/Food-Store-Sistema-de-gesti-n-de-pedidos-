// src/pages/admin/products/products.ts
import { auth } from "../../../utils/auth";
import { apiService } from "../../../utils/apiService";
import { navigate } from "../../../utils/navigate";
import type { Product } from "../../../types/product";
import type { ICategory } from "../../../types/category";

let productosMemoria: Product[] = [];
let categoriasMemoria: ICategory[] = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!auth.verificarPermisos("ADMIN")) {
    alert("Acceso denegado.");
    navigate.toLogin();
    return;
  }

  const tbody = document.getElementById("tabla-productos-body") as HTMLTableSectionElement;
  const btnNuevo = document.getElementById("btn-nuevo-prod") as HTMLButtonElement;
  const modal = document.getElementById("modal-producto") as HTMLDivElement;
  const btnCerrar = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;
  const form = document.getElementById("productoForm") as HTMLFormElement;
  const selectCat = document.getElementById("prodCategoria") as HTMLSelectElement;

  try {
    categoriasMemoria = await apiService.getCategorias();
    
    // revisar si ya existen productos guardados en el localstorage
    const productosLocales = localStorage.getItem("productos_registrados");

    if (productosLocales) {
      // si ya hay datos locales, usamos esos directamente
      productosMemoria = JSON.parse(productosLocales);
    } else {
      // si es la primera vez, traemos los del json base
      const productosJson = await apiService.getProductos();
      
      // mapear relaciones para armar el objeto categoria anidado
      productosMemoria = productosJson.map((p: any) => {
        const idCat = p.categoriaId || p.categorias || 1;
        const catEncontrada = categoriasMemoria.find(c => c.id === idCat);
        return {
          ...p,
          categoria: catEncontrada || { id: 1, nombre: "General", descripcion: "", eliminado: false, createdAt: "" }
        };
      });

      // guardar en localstorage para que ya quede la base armada
      guardarEnLocalStorage();
    }

    poblarSelectorCategorias();
    renderizarTabla();
  } catch (error) {
    console.error("Error al inicializar productos:", error);
  }

  // funcion auxiliar para actualizar el localstorage
  function guardarEnLocalStorage() {
    localStorage.setItem("productos_registrados", JSON.stringify(productosMemoria));
  }

  // abrir y cerrar modal
  btnNuevo.addEventListener("click", () => modal.style.display = "flex");
  btnCerrar.addEventListener("click", () => {
    form.reset();
    modal.style.display = "none";
  });

  function poblarSelectorCategorias() {
    selectCat.innerHTML = "";
    categoriasMemoria.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id.toString();
      option.textContent = c.nombre;
      selectCat.appendChild(option);
    });
  }

  // guardar nuevo producto
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById("prodNombre") as HTMLInputElement;
    const precioInput = document.getElementById("prodPrecio") as HTMLInputElement;
    const stockInput = document.getElementById("prodStock") as HTMLInputElement;
    const descInput = document.getElementById("prodDescripcion") as HTMLInputElement;

    const precio = parseFloat(precioInput.value);
    const stock = parseInt(stockInput.value);

    if (precio <= 0 || stock < 0) {
      alert("Datos invalidos.");
      return;
    }

    const idCatElegido = parseInt(selectCat.value);
    const catObjeto = categoriasMemoria.find(c => c.id === idCatElegido)!;

    const nuevoProd: Product = {
      id: productosMemoria.length + 1,
      eliminado: false,
      createdAt: new Date().toISOString(),
      nombre: nombreInput.value.trim(),
      descripcion: descInput.value.trim(),
      precio: precio,
      stock: stock,
      imagen: "pizza.jpg", 
      disponible: stock > 0,
      categoria: catObjeto
    };

    // meter en la lista, actualizar storage y redibujar
    productosMemoria.push(nuevoProd);
    guardarEnLocalStorage();
    renderizarTabla();
    
    form.reset();
    modal.style.display = "none";
    alert("Producto guardado con éxito en LocalStorage.");
  });

  // armar la tabla
  function renderizarTabla() {
    tbody.innerHTML = "";

    productosMemoria.forEach(p => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #ddd";

      tr.innerHTML = `
        <td style="padding: 12px; border: 1px solid #ddd;">${p.id}</td>
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${p.nombre}</td>
        <td style="padding: 12px; border: 1px solid #ddd;"><span style="background: #e3f2fd; color: #0d47a1; padding: 4px 8px; border-radius: 4px; font-size: 13px;">${p.categoria.nombre}</span></td>
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #2e7d32;">$${p.precio.toFixed(2)}</td>
        <td style="padding: 12px; border: 1px solid #ddd;">${p.stock} u.</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center; gap: 5px; display: flex; justify-content: center;">
            <button class="btn-editar" style="background-color: #ff9800; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                Editar
            </button>
            <button class="btn-eliminar" style="background-color: #d32f2f; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                Eliminar
            </button>
        </td>
      `;

      // editar en caliente y guardar
      const btnEditar = tr.querySelector(".btn-editar") as HTMLButtonElement;
      btnEditar.addEventListener("click", () => {
        const nuevoPrecio = prompt(`Cambiar precio de ${p.nombre}:`, p.precio.toString());
        const nuevoStock = prompt(`Cambiar stock de ${p.nombre}:`, p.stock.toString());

        if (nuevoPrecio !== null && nuevoStock !== null) {
          const precioNum = parseFloat(nuevoPrecio);
          const stockNum = parseInt(nuevoStock);

          if (precioNum > 0 && stockNum >= 0) {
            p.precio = precioNum;
            p.stock = stockNum;
            p.disponible = stockNum > 0;
            
            guardarEnLocalStorage(); // persistir edicion
            renderizarTabla();
            alert("Cambios guardados.");
          } else {
            alert("Valores inválidos.");
          }
        }
      });

      // borrar y actualizar
      const btnEliminar = tr.querySelector(".btn-eliminar") as HTMLButtonElement;
      btnEliminar.addEventListener("click", () => {
        if (confirm(`¿Borrar "${p.nombre}"?`)) {
          productosMemoria = productosMemoria.filter(prod => prod.id !== p.id);
          guardarEnLocalStorage(); // persistir baja
          renderizarTabla();
        }
      });

      tbody.appendChild(tr);
    });
  }
});