// src/pages/admin/categories/categories.ts
import { auth } from "../../../utils/auth";
import { apiService } from "../../../utils/apiService";
import { navigate } from "../../../utils/navigate";
import type { ICategory } from "../../../types/category";

let categoriasMemoria: ICategory[] = [];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Validar seguridad de rol (FHU-07 Criterio 1)
  if (!auth.verificarPermisos("ADMIN")) {
    alert("Acceso denegado.");
    navigate.toLogin();
    return;
  }

  const tbody = document.getElementById("tabla-categorias-body") as HTMLTableSectionElement;
  const btnNuevo = document.getElementById("btn-nueva-cat") as HTMLButtonElement;
  const modal = document.getElementById("modal-categoria") as HTMLDivElement;
  const btnCerrar = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;
  const form = document.getElementById("categoriaForm") as HTMLFormElement;

  // Cargar los datos desde el apiService al iniciar (FHU-08 Criterio 1)
  try {
    categoriasMemoria = await apiService.getCategorias();
    renderizarTabla();
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }

  // Controladores de apertura/cierre de modal
  btnNuevo.addEventListener("click", () => modal.style.display = "flex");
  btnCerrar.addEventListener("click", () => {
    form.reset();
    modal.style.display = "none";
  });

  // Procesar la simulación de Alta (FHU-08 Criterio 2 y 5)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById("catNombre") as HTMLInputElement;
    const descInput = document.getElementById("catDescripcion") as HTMLInputElement;

    const nuevaCat: ICategory = {
      id: categoriasMemoria.length + 1, // ID incremental simulado
      eliminado: false,
      createdAt: new Date().toISOString(),
      nombre: nombreInput.value.trim(),
      descripcion: descInput.value.trim()
    };

    // Agregamos al estado local en memoria como exige el TPI (FHU-08 Criterio 5)
    categoriasMemoria.push(nuevaCat);
    
    // Refrescar tabla de forma inmediata (FHU-08 Criterio 6)
    renderizarTabla();
    
    form.reset();
    modal.style.display = "none";
    alert("Categoría creada con éxito (Simulado en memoria).");
  });

  // Renderizar las filas de la tabla de forma dinámica
  function renderizarTabla() {
    tbody.innerHTML = "";
    
    categoriasMemoria.forEach(c => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #ddd";

      tr.innerHTML = `
        <td style="padding: 12px; border: 1px solid #ddd;">${c.id}</td>
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${c.nombre}</td>
        <td style="padding: 12px; border: 1px solid #ddd; color: #555;">${c.descripcion}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
            <button class="btn-eliminar" data-id="${c.id}" style="background-color: #d32f2f; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                Eliminar
            </button>
        </td>
      `;

      // Simulación rústica de Baja lógica en memoria (FHU-08 Criterio 4 y 5)
      const btnEliminar = tr.querySelector(".btn-eliminar") as HTMLButtonElement;
      btnEliminar.addEventListener("click", () => {
        if (confirm(`¿Está seguro de eliminar la categoría "${c.nombre}"?`)) {
          categoriasMemoria = categoriasMemoria.filter(cat => cat.id !== c.id);
          renderizarTabla();
        }
      });

      tbody.appendChild(tr);
    });
  }
});