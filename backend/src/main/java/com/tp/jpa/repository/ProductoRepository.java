package com.tp.jpa.repository;

import com.tp.jpa.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;

public class ProductoRepository extends BaseRepository<Producto> {
    public ProductoRepository() {
        super(Producto.class);
    }


    /**
     * Recupera una lista de productos activos que pertenecen a una categoría específica.
     * * La consulta JPQL realiza lo siguiente:
     * - Filtra los productos por el identificador de la categoría asociada.
     * - Excluye los productos que han sido marcados como borrados de forma lógica.
     * * @param categoriaId Identificador único de la categoría a consultar.
     * @return Lista de Producto que cumplen con los criterios de búsqueda.
     */
    public List<Producto> buscarPorCategoria(Long categoriaId) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Producto p WHERE p.categoria.id = :categoriaId AND p.eliminado = false";
            TypedQuery<Producto> query = em.createQuery(jpql, Producto.class);
            query.setParameter("categoriaId", categoriaId);
            return query.getResultList();
        } finally {
            em.close();
        }
    }
}
