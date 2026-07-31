package com.tp.jpa.service;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.time.LocalDate;
import java.util.Map;

public class PedidoService {
    private final EntityManagerFactory emf;

    public PedidoService() {
        this.emf = JPAUtil.getEntityManagerFactory();
    }

    public Pedido registrarPedido(Long idUsuario, FormaPago formaPago, Map<Long, Integer> listaTemporal) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin(); // inicio transaccion unica

            // 1. buscar usuario real
            Usuario usuario = em.find(Usuario.class, idUsuario);
            if (usuario == null || usuario.isEliminado()) {
                throw new RuntimeException("El usuario no existe o esta de baja.");
            }

            // 2. creamos el objeto a la vieja escuela para evitar problemas de Lombok
            Pedido pedido = new Pedido();
            pedido.setFecha(LocalDate.now());
            pedido.setEstado(Estado.PENDIENTE);
            pedido.setFormaPago(formaPago);
            pedido.setUsuario(usuario); // aca asignamos tu atributo real
            pedido.setEliminado(false);

            // 3. recorrer el mapa temporal de productos
            for (Map.Entry<Long, Integer> entry : listaTemporal.entrySet()) {
                Long idProducto = entry.getKey();
                int cantidad = entry.getValue();

                Producto producto = em.find(Producto.class, idProducto);

                if (producto == null || producto.isEliminado()) {
                    throw new RuntimeException("El producto con ID " + idProducto + " no existe.");
                }
                if (!producto.isDisponible()) {
                    throw new RuntimeException("El producto no esta disponible.");
                }
                if (producto.getStock() < cantidad) {
                    throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
                }

                // 4. usar tu metodo de negocio para calcular subtotal y agregarlo
                pedido.addDetallePedido(cantidad, producto);

                // 5. restar stock en caliente
                producto.setStock(producto.getStock() - cantidad);
            }

            // 6. guardar el pedido
            em.persist(pedido);

            em.getTransaction().commit(); // confirmar cambios
            return pedido;

        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback(); // deshacer todo ante fallas
            }
            throw new RuntimeException(e.getMessage(), e);
        } finally {
            em.close();
        }
    }
}