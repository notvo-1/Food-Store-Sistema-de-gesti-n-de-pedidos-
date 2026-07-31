# 🍔 Food Store - Trabajo Final Integrador

**Alumno:** Orellana Matias
**Link video: https://www.youtube.com/watch?v=zXzD206nrJk**
**Alternativo: https://drive.google.com/file/d/1arhfTO3vKdwGic0hKXE9mBUmrR_-_Bj9/view?usp=sharing**

**Food Store** es el Trabajo Final Integrador realizado para la materia **Programación III**.

El proyecto consiste en un sistema de gestión de pedidos de comida dividido en dos módulos:

- **Frontend:** aplicación web desarrollada con **TypeScript** y **Vite**.
- **Backend:** aplicación desarrollada con **Java**, **JPA/Hibernate**, **Gradle** y base de datos **H2**.

## 📁 Estructura del proyecto

```text
FoodStore/
│
├── frontend/   → Aplicación web
└── backend/    → Lógica de negocio y persistencia
```

---

# 👤 Usuarios de prueba

## Cliente

- **Email:** `cliente@food.com`
- **Contraseña:** `cliente123`

Permite:

- Ver el catálogo.
- Buscar y filtrar productos.
- Agregar productos al carrito.
- Realizar pedidos.
- Consultar el historial de compras.

---

## Administrador

- **Email:** `admin@admin.com`
- **Contraseña:** `123456`

Permite:

- Acceder al panel de administración.
- Gestionar categorías.
- Gestionar productos.
- Administrar pedidos.
- Visualizar estadísticas generales.

---

# 💻 Frontend

## Requisitos

- Node.js 18 o superior.

## Instalación

Ingresar a la carpeta `frontend` y ejecutar:

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

Los datos utilizados por el frontend se encuentran en:

```text
public/data/
```

---

# ☕ Backend

## Requisitos

- Java JDK 17 o superior.

## Compilar

Ubicarse en la carpeta `backend` y ejecutar:

```bash
./gradlew clean build
```

En Windows también puede utilizarse:

```bash
gradlew clean build
```

## Ejecutar

```bash
./gradlew run
```

o en Windows:

```bash
gradlew run
```

La base de datos H2 se crea automáticamente la primera vez que se inicia la aplicación.

Ubicación:

```text
backend/data/jpa_db
```

---

# 📌 Características implementadas

- Repositorio genérico para las operaciones CRUD utilizando JPA.
- Baja lógica (Soft Delete) para conservar el historial de información.
- Alta de pedidos con validación de stock y actualización automática del inventario dentro de una misma transacción.
- Consultas JPQL tipadas para búsquedas y filtros.
- Arquitectura en capas separando entidades, repositorios, servicios y lógica de negocio.

---

# 🛠 Tecnologías utilizadas

### Frontend

- TypeScript
- Vite
- HTML
- CSS

### Backend

- Java 17
- JPA
- Hibernate
- Gradle
- H2 Database

---

Proyecto realizado como Trabajo Final Integrador para la materia **Programación III**.