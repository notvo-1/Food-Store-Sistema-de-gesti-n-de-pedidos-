package com.tp.jpa.repository;

import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.Pedido;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    // consulta para buscar un usuario activo usando su email
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT u FROM Usuario u WHERE u.email = :mail AND u.eliminado = false";
            TypedQuery<Usuario> query = em.createQuery(jpql, Usuario.class);
            query.setParameter("mail", mail);
            List<Usuario> resultado = query.getResultList();

            return resultado.isEmpty() ? Optional.empty() : Optional.of(resultado.get(0));
        } finally {
            em.close();
        }
    }

    // consulta para traer la lista de pedidos activos de un usuario
    public List<Pedido> buscarPedidosPorUsuario(Long idUsuario) {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT p FROM Usuario u JOIN u.pedidos p WHERE u.id = :uid AND p.eliminado = false";
            TypedQuery<Pedido> query = em.createQuery(jpql, Pedido.class);
            query.setParameter("uid", idUsuario);

            return query.getResultList();
        } finally {
            em.close();
        }
    }
}