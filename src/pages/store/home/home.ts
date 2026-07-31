import { apiService } from "../../../utils/apiService";
import type { ICategory } from "../../../types/category";
import type { Product } from "../../../types/product";
import { auth } from "../../../utils/auth";

const listaCategorias = document.getElementById(
  "lista-categorias",
) as HTMLElement;
const listaProductos = document.getElementById(
  "contenedor-productos",
) as HTMLElement;
const contadorElemento = document.getElementById(
  "contador-carrito",
) as HTMLElement;
const formBusqueda = document.querySelector("form") as HTMLFormElement;
const inputBusqueda = document.getElementById(
  "buscarProducto",
) as HTMLInputElement;

// Almacenamos una copia local en memoria para los filtros en tiempo real
let todosLosProductos: Product[] = [];

// Evento de búsqueda por texto
formBusqueda.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = inputBusqueda.value.toLowerCase().trim();

  const productosFiltrados = todosLosProductos.filter((p) =>
    p.nombre.toLowerCase().includes(texto),
  );

  cargarProductos(productosFiltrados);
});


// Carga del sidebar categorias
const cargarCategorias = (categorias: ICategory[]) => {
  listaCategorias.innerHTML = ""; // Limpiamos contenedor

  const liTodas = document.createElement("li");
  liTodas.innerHTML = `<a href="#">Todas</a>`;
  liTodas.addEventListener("click", (e) => {
    e.preventDefault();
    cargarProductos(todosLosProductos);
  });
  listaCategorias.appendChild(liTodas);

  categorias.forEach((x) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = x.nombre;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Filtro simple para unificar el JSON plano y el objeto del admin
      const filtrados = todosLosProductos.filter((p: any) => {
        // 1. Si es el objeto completo que viene del admin
        if (p.categoria && typeof p.categoria === 'object') {
          return p.categoria.id.toString() === x.id.toString();
        }
        
        // 2. Si viene del JSON plano de la catedra (categoriaId, categorias, etc.)
        const idPlano = p.categoriaId || p.categorias || p.categoria;
        
        return idPlano && idPlano.toString() === x.id.toString();
      });
      
      cargarProductos(filtrados);
    });

    li.appendChild(a);
    listaCategorias.appendChild(li);
  });
};

// Actualizar cantidad del contador del cart
const actualizarContador = () => {
  if (contadorElemento) {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const total = carrito.reduce(
      (acc: number, item: any) => acc + item.cantidad,
      0,
    );
    contadorElemento.textContent = total.toString();
  }
};

// carga de tarjetas productos
const cargarProductos = (productos: Product[]) => {
  listaProductos.innerHTML = ""; // Limpiar el contenedor

  productos.forEach((p) => {
    const articulo = document.createElement("article");
    articulo.classList.add("articulo-destacado");

    const img = document.createElement("img");
    const titulo = document.createElement("h3");
    const descripcion = document.createElement("p");
    const precio = document.createElement("p");
    const btnAgregar = document.createElement("button");

    titulo.textContent = p.nombre;
    descripcion.textContent = p.descripcion;

    // Corregimos la asignación de la ruta de la imagen
    // img.src = p.imagen.startsWith('/') ? p.imagen : `/${p.imagen}`; // no hace falta porque ahora tengo un link desde productos.js
    img.src = p.imagen;
    precio.innerHTML = `<strong>Precio: $${p.precio}</strong>`;

    //detalle
    articulo.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).tagName !== "BUTTON") {
        window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${p.id}`;
      }
    });

    btnAgregar.textContent = "Agregar";
    btnAgregar.addEventListener("click", () => {
      const carritoActual = JSON.parse(localStorage.getItem("carrito") || "[]");
      const colorOriginal = btnAgregar.style.backgroundColor;
      const textoOriginal = btnAgregar.textContent;

      const efectoVisualBtn = () => {
        btnAgregar.style.backgroundColor = "#28a745"; // todo bien
        btnAgregar.textContent = "¡Agregado!";
        setTimeout(() => {
          btnAgregar.style.backgroundColor = colorOriginal;
          btnAgregar.textContent = textoOriginal;
        }, 600);
      };

      const existe = carritoActual.find(
        (item: any) => item.producto.id === p.id,
      );

      if (existe) {
        existe.cantidad += 1;
        efectoVisualBtn();
      } else {
        // Guardamos
        carritoActual.push({ producto: p, cantidad: 1 });
        efectoVisualBtn();
      }

      localStorage.setItem("carrito", JSON.stringify(carritoActual));
      actualizarContador();
    });

    articulo.appendChild(titulo);
    articulo.appendChild(img);
    articulo.appendChild(descripcion);
    articulo.appendChild(precio);
    articulo.appendChild(btnAgregar);

    listaProductos.appendChild(articulo);
  });
};

// Init asinc de la página al arrancar. Consumo los servicios
const inicializarHome = async () => {
  try {
    auth.renderizarInfoSesion();
    actualizarContador();

    const listaCat = await apiService.getCategorias();
    
    // traer de localstorage para ver lo que creo el admin
    const productosLocales = localStorage.getItem("productos_registrados");

    if (productosLocales) {
      todosLosProductos = JSON.parse(productosLocales);
    } else {
      // si no hay nada en localstorage, cae al fetch inicial del json
      todosLosProductos = await apiService.getProductos();
    }

    cargarProductos(todosLosProductos);
    cargarCategorias(listaCat);
  } catch (error) {
    console.error("Error al inicializar el catálogo:", error);
  }
};

// inicializacion
inicializarHome();
