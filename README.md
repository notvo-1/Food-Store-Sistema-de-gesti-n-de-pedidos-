# Food Store — Sistema de Gestión de Pedidos de Comida

Proyecto final integrador de **Programación III** (Tecnicatura Universitaria
en Programación, UTN). Sistema full-stack para gestionar categorías,
productos, usuarios y pedidos de un local de comida, dividido en dos partes
independientes que se conectarán entre sí en una iteración futura.

## Arquitectura

```
Food-Store-Sistema-de-gestion-de-pedidos/
├── backend/     # Java + JPA/Hibernate + H2 — persistencia y lógica de negocio
└── frontend/    # TypeScript + Vite — interfaz web
```

| Parte | Stack | Descripción |
|---|---|---|
| **Backend** | Java, JPA/Hibernate, H2 (archivo) | Menú de consola con CRUD completo sobre Categoría, Producto, Usuario y Pedido. Persistencia mediante EntityManager, relaciones JPA unidireccionales, consultas JPQL y transacciones. |
| **Frontend** | TypeScript, Vite, HTML5/CSS3 | Tienda web (catálogo, carrito, checkout, historial de pedidos) y panel de administración (categorías, productos, pedidos), con roles ADMIN / USUARIO. |

En esta primera iteración el frontend consume datos desde archivos `.json`
locales (`fetch()`), de forma independiente al backend. La idea es que en una
iteración posterior esos `fetch` a `.json` se reemplacen por llamadas a la
API REST que expondría el backend.

## Modelo de dominio (backend)

- **Categoria** → **Producto** (1 a N)
- **Usuario** → **Pedido** (1 a N)
- **Pedido** → **DetallePedido** (composición, 1 a N)
- **DetallePedido** → **Producto** (N a 1)

Todas las entidades extienden una clase base con `id`, `eliminado` (baja
lógica) y `createdAt`.

## Cómo correr cada parte

Instrucciones detalladas de instalación y ejecución en el README de cada
carpeta:

- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

## Estado

Proyecto académico completo (ambas partes funcionales según la consigna del
TPI). Pendiente: integrar el frontend contra la API REST del backend en
lugar de los `.json` locales.
