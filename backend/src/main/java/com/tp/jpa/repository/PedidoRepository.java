package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.enums.Estado;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    // consulta para listar todos los pedidos activos segun su estado
    public List<Pedido> buscarPorEstado(Estado estado) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            TypedQuery<Pedido> query = em.createQuery(jpql, Pedido.class);
            query.setParameter("estado", estado);

            return query.getResultList();
        } finally {
            em.close();
        }
    }
}