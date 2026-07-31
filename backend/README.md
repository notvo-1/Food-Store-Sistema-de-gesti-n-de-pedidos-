# Parcial 2 - Programación III (JPA & Repositorios)

---
### Alumno: Orellana Matias
### TUPaD

---
### Descripción del Proyecto
Este proyecto es una extensión de la Unidad 8 para la Tecnicatura en Programación. Se implementó un patrón de diseño con repositorios genéricos (`BaseRepository<T>`) utilizando JPA y Hibernate para manejar la persistencia en una base de datos embebida H2.

El sistema cuenta con una interfaz por consola que permite hacer operaciones ABM completas sobre **Categorías** y **Productos**, además de un reporte personalizado con JPQL para filtrar productos activos por su categoría.

---

### Requisitos Previos
* Java 17 o superior instalado.
* Gradle (incluido en el proyecto mediante el wrapper).

---

### Instrucciones para Ejecutarlo

Para levantar el proyecto y abrir el menú de consola, seguí estos pasos según tu sistema operativo:

#### En Windows (CMD o PowerShell):
1. Abrí la terminal en la carpeta raíz del proyecto.
2. Ejecutá el siguiente comando:
   ```bash
   ./gradlew run 
   ```
#### En Linux / macOS:
Abrí la terminal en la carpeta raíz del proyecto.

Dale permisos de ejecución al script (solo la primera vez):

```Bash
chmod +x gradlew
```
Ejecutá el proyecto con:
```Bash
./gradlew run
```

---

#### Estructura Principal del Menú
Una vez que arranque, vas a ver las siguientes opciones interactivas:

1. ABM Categorías: Alta, Baja lógica (eliminado = true), Modificación y Listado de activas.

2. ABM Productos: Alta (asociando a categoría existente), Baja lógica, Modificación y Listado general con su categoría mapeada.

3. Reportes: Consulta filtrada de productos activos por ID de categoría mediante TypedQuery en JPQL.