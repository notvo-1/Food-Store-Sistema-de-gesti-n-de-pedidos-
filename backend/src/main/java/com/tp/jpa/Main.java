package com.tp.jpa;

import com.tp.jpa.model.*;
import com.tp.jpa.model.enums.*;
import com.tp.jpa.repository.*;
import com.tp.jpa.service.PedidoService;
import com.tp.jpa.util.JPAUtil;

import java.util.*;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);
    private static final CategoriaRepository catRepo = new CategoriaRepository();
    private static final ProductoRepository prodRepo = new ProductoRepository();
    private static final UsuarioRepository usuRepo = new UsuarioRepository();
    private static final PedidoRepository pedRepo = new PedidoRepository();
    private static final PedidoService pedService = new PedidoService();

    public static void main(String[] args) {
        int opcion;
        do {
            System.out.println("\n--- FOOD STORE - MENU PRINCIPAL ---");
            System.out.println("1. Gestionar Categorias");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Elegi una opcion: ");
            opcion = Integer.parseInt(scanner.nextLine());

            switch (opcion) {
                case 1 -> menuCategorias();
                case 2 -> menuProductos();
                case 3 -> menuUsuarios();
                case 4 -> menuPedidos();
                case 5 -> menuReportes();
                case 0 -> {
                    JPAUtil.shutdown(); // Cierra la conexion a la bd antes de salir
                    System.out.println("Chau!");
                }
                default -> System.out.println("Opcion invalida.");
            }
        } while (opcion != 0);
    }

    // --- SUBMENU CATEGORIAS ---
    private static void menuCategorias() {
        System.out.println("\n--- GESTION DE CATEGORIAS ---");
        System.out.println("1. Alta");
        System.out.println("2. Modificar");
        System.out.println("3. Baja lógica");
        System.out.println("4. Listado");
        System.out.println("0. Volver");
        System.out.print("Opcion: ");
        int op = Integer.parseInt(scanner.nextLine());

        if (op == 1) {
            System.out.print("Nombre: ");
            String nom = scanner.nextLine();
            if (nom.isBlank()) {
                System.out.println("El nombre no puede estar vacio.");
                return;
            }
            System.out.print("Descripcion: ");
            String desc = scanner.nextLine();
            Categoria c = Categoria.builder().nombre(nom).descripcion(desc).eliminado(false).build();
            c = catRepo.guardar(c);
            System.out.println("Categoria creada. ID: " + c.getId());
        } else if (op == 2) {
            // Muestro las categorias para saber cual elegir
            List<Categoria> lista = catRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay categorias activas para modificar."); return; }
            System.out.println("\n--- CATEGORIAS ACTIVAS ---");
            for (Categoria cat : lista) System.out.println("ID: " + cat.getId() + " | " + cat.getNombre());

            System.out.print("\nID a modificar: ");
            Long id = Long.parseLong(scanner.nextLine());
            Categoria c = catRepo.buscarPorId(id).orElse(null);
            if (c == null || c.isEliminado()) { System.out.println("Categoria no encontrada."); return; }

            System.out.println("Valores actuales - Nombre: " + c.getNombre() + " | Desc: " + c.getDescripcion());
            System.out.print("Nuevo Nombre (Enter para conservar): ");
            String nom = scanner.nextLine();
            System.out.print("Nueva Descripcion (Enter para conservar): ");
            String desc = scanner.nextLine();

            if (!nom.isBlank()) c.setNombre(nom);
            if (!desc.isBlank()) c.setDescripcion(desc);
            catRepo.guardar(c);
            System.out.println("Categoria modificada con éxito.");
        } else if (op == 3) {
            // Muestro las categorias antes de borrar
            List<Categoria> lista = catRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay categorias activas para dar de baja."); return; }
            System.out.println("\n--- CATEGORIAS ACTIVAS ---");
            for (Categoria cat : lista) System.out.println("ID: " + cat.getId() + " | " + cat.getNombre());

            System.out.print("\nID Categoria para baja: ");
            Long id = Long.parseLong(scanner.nextLine());
            Categoria c = catRepo.buscarPorId(id).orElse(null);
            if (catRepo.eliminarLogico(id)) {
                System.out.println("Baja exitosa de la categoria: " + (c != null ? c.getNombre() : id));
            } else {
                System.out.println("Error: No se encontró o ya estaba dada de baja.");
            }
        } else if (op == 4) {
            List<Categoria> lista = catRepo.listarActivos();
            if (lista.isEmpty()) System.out.println("No hay ninguna.");
            for (Categoria cat : lista) {
                System.out.println("ID: " + cat.getId() + " | " + cat.getNombre() + " - " + cat.getDescripcion());
            }
        }
    }

    // --- SUBMENU PRODUCTOS ---
    private static void menuProductos() {
        System.out.println("\n--- GESTION DE PRODUCTOS ---");
        System.out.println("1. Alta");
        System.out.println("2. Modificar");
        System.out.println("3. Baja lógica");
        System.out.println("4. Listado");
        System.out.println("0. Volver");
        System.out.print("Opcion: ");
        int op = Integer.parseInt(scanner.nextLine());

        if (op == 1) {
            List<Categoria> cats = catRepo.listarActivos();
            if (cats.isEmpty()) { System.out.println("Primero tenes que crear una categoria."); return; }
            for (Categoria c : cats) System.out.println("ID: " + c.getId() + " -> " + c.getNombre());
            System.out.print("ID Categoria: ");
            Long catId = Long.parseLong(scanner.nextLine());
            Categoria seleccionada = catRepo.buscarPorId(catId).orElse(null);
            if (seleccionada == null) { System.out.println("No existe esa categoria."); return; }

            System.out.print("Nombre producto: ");
            String nom = scanner.nextLine();
            System.out.print("Precio: ");
            Double prec = Double.parseDouble(scanner.nextLine());
            System.out.print("Stock inicial: ");
            int st = Integer.parseInt(scanner.nextLine());
            if (prec <= 0 || st < 0) { System.out.println("Valores invalidos."); return; }

            Producto p = Producto.builder()
                    .nombre(nom).precio(prec).stock(st)
                    .disponible(st > 0).eliminado(false)
                    .categoria(seleccionada).build();
            p = prodRepo.guardar(p);
            System.out.println("Producto guardado con ID: " + p.getId());
        } else if (op == 2) {
            // Muestro los productos para saber cual modificar
            List<Producto> lista = prodRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay productos activos para modificar."); return; }
            System.out.println("\n--- PRODUCTOS ACTIVOS ---");
            for (Producto prod : lista) System.out.println("ID: " + prod.getId() + " | " + prod.getNombre() + " | Stock: " + prod.getStock());

            System.out.print("\nID de producto a modificar: ");
            Long id = Long.parseLong(scanner.nextLine());
            Producto p = prodRepo.buscarPorId(id).orElse(null);
            if (p == null || p.isEliminado()) { System.out.println("Producto no encontrado."); return; }

            System.out.println("Valores actuales - Nombre: " + p.getNombre() + " | Precio: " + p.getPrecio() + " | Stock: " + p.getStock());
            System.out.print("Nuevo Nombre (Enter para conservar): ");
            String nom = scanner.nextLine();
            System.out.print("Nuevo Precio (Enter para conservar): ");
            String precStr = scanner.nextLine();
            System.out.print("Nuevo Stock (Enter para conservar): ");
            String stStr = scanner.nextLine();

            if (!nom.isBlank()) p.setNombre(nom);
            if (!precStr.isBlank()) {
                double pr = Double.parseDouble(precStr);
                if(pr > 0) p.setPrecio(pr); else System.out.println("Precio inválido, se conserva anterior.");
            }
            if (!stStr.isBlank()) {
                int st = Integer.parseInt(stStr);
                if(st >= 0) { p.setStock(st); p.setDisponible(st > 0); } else System.out.println("Stock inválido.");
            }
            prodRepo.guardar(p);
            System.out.println("Producto modificado correctamente.");
        } else if (op == 3) {
            // Muestro los productos antes de dar la baja
            List<Producto> lista = prodRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay productos activos para dar de baja."); return; }
            System.out.println("\n--- PRODUCTOS ACTIVOS ---");
            for (Producto prod : lista) System.out.println("ID: " + prod.getId() + " | " + prod.getNombre());

            System.out.print("\nID Producto para baja: ");
            Long id = Long.parseLong(scanner.nextLine());
            Producto p = prodRepo.buscarPorId(id).orElse(null);
            if (prodRepo.eliminarLogico(id)) {
                System.out.println("Baja lógica del producto: " + (p != null ? p.getNombre() : id));
            } else { System.out.println("Error al dar de baja."); }
        } else if (op == 4) {
            List<Producto> lista = prodRepo.listarActivos();
            for (Producto p : lista) {
                System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock() + " | Cat: " + p.getCategoria().getNombre());
            }
        }
    }

    // --- SUBMENU USUARIOS ---
    private static void menuUsuarios() {
        System.out.println("\n--- GESTION DE USUARIOS ---");
        System.out.println("1. Alta");
        System.out.println("2. Modificar");
        System.out.println("3. Baja lógica");
        System.out.println("4. Listado");
        System.out.println("5. Buscar por mail");
        System.out.println("0. Volver");
        System.out.print("Opcion: ");
        int op = Integer.parseInt(scanner.nextLine());

        if (op == 1) {
            System.out.print("Nombre: "); String nom = scanner.nextLine();
            System.out.print("Apellido: "); String ape = scanner.nextLine();
            System.out.print("Email: "); String email = scanner.nextLine();
            System.out.print("Pass: "); String pass = scanner.nextLine();
            System.out.print("Rol (ADMIN/USUARIO): ");
            Rol rol = Rol.valueOf(scanner.nextLine().toUpperCase());

            if (usuRepo.buscarPorMail(email).isPresent()) {
                System.out.println("Ese email ya esta registrado.");
                return;
            }

            Usuario u = Usuario.builder()
                    .nombre(nom).apellido(ape).email(email)
                    .contrasenia(pass).rol(rol).eliminado(false).build();
            u = usuRepo.guardar(u);
            System.out.println("Usuario creado con ID: " + u.getId());
        } else if (op == 2) {
            // Muestro la lista de usuarios activos para elegir bien el ID
            List<Usuario> lista = usuRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay usuarios activos para modificar."); return; }
            System.out.println("\n--- USUARIOS ACTIVOS ---");
            for (Usuario usu : lista) System.out.println("ID: " + usu.getId() + " | " + usu.getNombre() + " " + usu.getApellido() + " | Email: " + usu.getEmail());

            System.out.print("\nID de usuario a modificar: ");
            Long id = Long.parseLong(scanner.nextLine());
            Usuario u = usuRepo.buscarPorId(id).orElse(null);
            if (u == null || u.isEliminado()) { System.out.println("Usuario no encontrado."); return; }

            System.out.println("Valores actuales - Nombre: " + u.getNombre() + " | Apellido: " + u.getApellido() + " | Email: " + u.getEmail());
            System.out.print("Nuevo Nombre (Enter para conservar): "); String nom = scanner.nextLine();
            System.out.print("Nuevo Apellido (Enter para conservar): "); String ape = scanner.nextLine();
            System.out.print("Nuevo Email (Enter para conservar): "); String email = scanner.nextLine();

            if (!nom.isBlank()) u.setNombre(nom);
            if (!ape.isBlank()) u.setApellido(ape);
            if (!email.isBlank()) {
                Optional<Usuario> existente = usuRepo.buscarPorMail(email);
                if (existente.isPresent() && !existente.get().getId().equals(u.getId())) {
                    System.out.println("Error: El email ya está en uso por otro usuario. No se modificó el mail.");
                } else {
                    u.setEmail(email);
                }
            }
            usuRepo.guardar(u);
            System.out.println("Usuario modificado correctamente.");
        } else if (op == 3) {
            // Listar usuarios antes de eliminar alguno
            List<Usuario> lista = usuRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay usuarios activos para dar de baja."); return; }
            System.out.println("\n--- USUARIOS ACTIVOS ---");
            for (Usuario usu : lista) System.out.println("ID: " + usu.getId() + " | " + usu.getNombre() + " " + usu.getApellido());

            System.out.print("\nID Usuario para baja: ");
            Long id = Long.parseLong(scanner.nextLine());
            Usuario u = usuRepo.buscarPorId(id).orElse(null);
            if (usuRepo.eliminarLogico(id)) {
                System.out.println("Baja lógica del usuario: " + (u != null ? (u.getNombre() + " " + u.getApellido()) : id));
            } else { System.out.println("Error al dar de baja al usuario."); }
        } else if (op == 4) {
            for (Usuario u : usuRepo.listarActivos()) {
                System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " | " + u.getEmail() + " | " + u.getRol());
            }
        } else if (op == 5) {
            // Nueva opcion para buscar un usuario por su mail
            System.out.print("Ingresa el mail a buscar: ");
            String mailBuscar = scanner.nextLine();
            Optional<Usuario> busqueda = usuRepo.buscarPorMail(mailBuscar);

            if (busqueda.isPresent()) {
                Usuario u = busqueda.get();
                System.out.println("\n--- USUARIO ENCONTRADO ---");
                System.out.println("ID: " + u.getId());
                System.out.println("Nombre Completo: " + u.getNombre() + " " + u.getApellido());
                System.out.println("Email: " + u.getEmail());
                System.out.println("Celular: " + u.getCelular());
                System.out.println("Rol: " + u.getRol());
            } else {
                System.out.println("No existe un usuario activo con ese mail.");
            }
        }
    }

    // --- SUBMENU PEDIDOS ---
    // --- SUBMENU PEDIDOS ---
    private static void menuPedidos() {
        System.out.println("\n--- GESTION DE PEDIDOS ---");
        System.out.println("1. Alta de Pedido");
        System.out.println("2. Cambiar Estado");
        System.out.println("3. Baja lógica");
        System.out.println("4. Listado Completo");
        System.out.println("5. Pedidos por usuario");
        System.out.println("6. Pedidos por estado");
        System.out.println("0. Volver");
        System.out.print("Opcion: ");
        int op = Integer.parseInt(scanner.nextLine());

        if (op == 1) {
            List<Usuario> usus = usuRepo.listarActivos();
            if (usus.isEmpty()) {
                System.out.println("No hay usuarios cargados.");
                return;
            }
            for (Usuario u : usus) System.out.println("ID: " + u.getId() + " -> " + u.getNombre());
            System.out.print("Elegi ID Usuario: ");
            Long uid = Long.parseLong(scanner.nextLine());

            System.out.print("Pago (TARJETA, TRANSFERENCIA, EFECTIVO): ");
            FormaPago pago = FormaPago.valueOf(scanner.nextLine().toUpperCase());

            Map<Long, Integer> carritoTemporal = new HashMap<>();
            String seguir;

            do {
                System.out.println("\n--- PRODUCTOS DISPONIBLES ---");
                for (Producto p : prodRepo.listarActivos()) {
                    if (p.isDisponible() && p.getStock() > 0) {
                        System.out.println("ID: " + p.getId() + " | " + p.getNombre() + " | $" + p.getPrecio() + " | Stock: " + p.getStock());
                    }
                }
                System.out.print("ID Producto a agregar: ");
                Long pid = Long.parseLong(scanner.nextLine());
                System.out.print("Cantidad: ");
                int cant = Integer.parseInt(scanner.nextLine());

                carritoTemporal.put(pid, cant);

                System.out.print("¿Agregar otro? (S/N): ");
                seguir = scanner.nextLine().toUpperCase();
            } while (seguir.equals("S"));

            try {
                Pedido guardado = pedService.registrarPedido(uid, pago, carritoTemporal);
                System.out.println("\n¡Pedido guardado con exito! ID: " + guardado.getId());
                System.out.println("Monto Final Cobrado: $" + guardado.getTotal());
            } catch (Exception e) {
                System.out.println("Error al procesar la orden: " + e.getMessage());
            }
        } else if (op == 2) {
            List<Pedido> lista = pedRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay pedidos activos registrados."); return; }
            System.out.println("\n--- PEDIDOS REGISTRADOS ---");
            for (Pedido ped : lista) System.out.println("ID: " + ped.getId() + " | Estado: " + ped.getEstado() + " | Total: $" + ped.getTotal());

            System.out.print("\nID Pedido a modificar: ");
            Long pedId = Long.parseLong(scanner.nextLine());
            Pedido p = pedRepo.buscarPorId(pedId).orElse(null);
            if (p == null || p.isEliminado()) {
                System.out.println("Pedido no encontrado.");
                return;
            }
            System.out.println("Estado actual: " + p.getEstado());
            System.out.print("Nuevo Estado (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO): ");
            Estado nuevoEst = Estado.valueOf(scanner.nextLine().toUpperCase());

            p.setEstado(nuevoEst);
            pedRepo.guardar(p);
            System.out.println("Estado actualizado correctamente.");
        } else if (op == 3) {
            List<Pedido> lista = pedRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay pedidos registrados para dar de baja."); return; }
            System.out.println("\n--- PEDIDOS REGISTRADOS ---");
            for (Pedido ped : lista) System.out.println("ID: " + ped.getId() + " | Total: $" + ped.getTotal());

            System.out.print("\nID Pedido para baja lógica: ");
            Long id = Long.parseLong(scanner.nextLine());
            Pedido p = pedRepo.buscarPorId(id).orElse(null);
            if (pedRepo.eliminarLogico(id)) {
                System.out.println("Baja lógica del pedido ID: " + id + " | Total del pedido afectado: $" + (p != null ? p.getTotal() : "0.00"));
            } else { System.out.println("Error al dar de baja el pedido."); }
        } else if (op == 4) {
            List<Pedido> lista = pedRepo.listarActivos();
            if (lista.isEmpty()) { System.out.println("No hay pedidos registrados."); return; }
            System.out.println("\n--- LISTA DE PEDIDOS ---");
            for (Pedido p : lista) {
                System.out.println("ID: " + p.getId() +
                        " | Fecha: " + p.getFecha() +
                        " | Pago: " + p.getFormaPago() +
                        " | Estado: " + p.getEstado() +
                        " | Total: $" + p.getTotal());
            }
        } else if (op == 5) {
            // Muestro la lista de usuarios para seleccionar uno
            List<Usuario> usus = usuRepo.listarActivos();
            if (usus.isEmpty()) { System.out.println("No hay usuarios registrados."); return; }
            System.out.println("\n--- USUARIOS ACTIVOS ---");
            for (Usuario u : usus) System.out.println("ID: " + u.getId() + " -> " + u.getNombre());

            System.out.print("\nElegi el ID del Usuario: ");
            Long uid = Long.parseLong(scanner.nextLine());
            List<Pedido> peds = usuRepo.buscarPedidosPorUsuario(uid);

            if (peds.isEmpty()) {
                System.out.println("Este usuario no tiene pedidos.");
            } else {
                System.out.println("\n--- PEDIDOS DEL USUARIO ---");
                for (Pedido p : peds) {
                    System.out.println("ID: " + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() + " | Total: $" + p.getTotal());
                }
            }
        } else if (op == 6) {
            // Filtro pedidos directamente segun su enumerado
            System.out.print("Elegi el Estado (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO): ");
            Estado est = Estado.valueOf(scanner.nextLine().toUpperCase());
            List<Pedido> peds = pedRepo.buscarPorEstado(est);

            if (peds.isEmpty()) {
                System.out.println("No hay pedidos con ese estado.");
            } else {
                System.out.println("\n--- PEDIDOS CON ESTADO " + est + " ---");
                for (Pedido p : peds) {
                    System.out.println("ID Pedido: " + p.getId() + " | Fecha: " + p.getFecha() + " | Total: $" + p.getTotal());
                }
            }
        }
    }

    // --- SUBMENU REPORTES Y CONSULTAS JPQL ---
    private static void menuReportes() {
        System.out.println("\n--- REPORTES ---");
        System.out.println("1. Productos por categoria (JOIN)");
        System.out.println("2. Pedidos por usuario");
        System.out.println("3. Pedidos por estado");
        System.out.println("4. Total facturado");
        System.out.println("0. Volver");
        System.out.print("Opcion: ");
        int op = Integer.parseInt(scanner.nextLine());

        if (op == 1) {
            System.out.print("ID Categoria: ");
            Long cid = Long.parseLong(scanner.nextLine());
            List<Producto> prods = catRepo.buscarProductosPorCategoria(cid);
            if (prods.isEmpty()) System.out.println("No hay productos en esta categoria.");
            for (Producto p : prods) System.out.println("- " + p.getNombre() + " | $" + p.getPrecio());
        } else if (op == 2) {
            // Muestro los usuarios cargados para elegir mas facil
            List<Usuario> usuarios = usuRepo.listarActivos();
            if (usuarios.isEmpty()) {
                System.out.println("No hay usuarios cargados en el sistema.");
                return;
            }
            System.out.println("\n--- USUARIOS DISPONIBLES ---");
            for (Usuario u : usuarios) {
                System.out.println("ID: " + u.getId() + " | " + u.getNombre() + " " + u.getApellido() + " | Email: " + u.getEmail());
            }

            System.out.print("\nElegi el ID del Usuario: ");
            Long uid = Long.parseLong(scanner.nextLine());
            List<Pedido> peds = usuRepo.buscarPedidosPorUsuario(uid);
            if (peds.isEmpty()) System.out.println("Este usuario no tiene pedidos.");
            for (Pedido p : peds) System.out.println("- Pedido #" + p.getId() + " | Fecha: " + p.getFecha() + " | Estado: " + p.getEstado() + " | Total: $" + p.getTotal());
        } else if (op == 3) {
            System.out.print("Estado (PENDIENTE, CONFIRMADO, TERMINADO, CANCELADO): ");
            Estado est = Estado.valueOf(scanner.nextLine().toUpperCase());
            List<Pedido> peds = pedRepo.buscarPorEstado(est);
            if (peds.isEmpty()) {
                System.out.println("No hay pedidos con ese estado.");
            } else {
                System.out.println("\n--- DETALLE DE PEDIDOS POR ESTADO (" + est + ") ---");
                for (Pedido p : peds) {
                    System.out.println("ID Pedido: " + p.getId() +
                            " | Fecha: " + p.getFecha() +
                            " | Pago: " + p.getFormaPago() +
                            " | Estado: " + p.getEstado() +
                            " | Total: $" + p.getTotal());
                }
            }
        } else if (op == 4) {
            List<Pedido> terminados = pedRepo.buscarPorEstado(Estado.TERMINADO);
            double totalFacturado = terminados.stream()
                    .map(Pedido::getTotal)
                    .filter(Objects::nonNull)
                    .mapToDouble(Double::doubleValue)
                    .sum();
            System.out.format(Locale.US, "Total facturado: $%.2f\n", totalFacturado);
        }
    }
}