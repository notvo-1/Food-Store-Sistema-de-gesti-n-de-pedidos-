package com.tp.jpa.repository;

import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;
import java.util.Optional;
public abstract class BaseRepository<T> {
    protected final Class<T> entityClass;
    protected final EntityManagerFactory emf;

    public BaseRepository(Class<T> entityClass) {
        this.entityClass = entityClass;
        this.emf = JPAUtil.getEntityManagerFactory();
    }

    public T guardar(T entity) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();

            // Obtener el ID usando reflexión para el chequeo genérico
            Long id = null;
            try {
                id = (Long) entity.getClass().getMethod("getId").invoke(entity);
            } catch (Exception e) {
                // Manejo alternativo o log si es necesario
            }

            T managedEntity;
            if (id == null) {
                em.persist(entity);
                managedEntity = entity; // persist asigna el ID a la propia instancia
            } else {
                managedEntity = em.merge(entity);
            }

            em.getTransaction().commit();
            return managedEntity;
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw new RuntimeException("Error al guardar la entidad: " + e.getMessage(), e);
        } finally {
            em.close();
        }
    }

    public Optional<T> buscarPorId(Long id) {
        EntityManager em = emf.createEntityManager();
        try {
            T entity = em.find(entityClass, id);
            return Optional.ofNullable(entity);
        } finally {
            em.close();
        }
    }

    public List<T> listarActivos() {
        EntityManager em = emf.createEntityManager();
        try {
            String jpql = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.eliminado = false";
            return em.createQuery(jpql, entityClass).getResultList();
        } finally {
            em.close();
        }
    }

    public boolean eliminarLogico(Long id) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();
            T entity = em.find(entityClass, id);
            if (entity != null) {
                entityClass.getMethod("setEliminado", boolean.class).invoke(entity, true);
                em.merge(entity);
                em.getTransaction().commit();
                return true;
            }
            return false;
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            return false;
        } finally {
            em.close();
        }
    }
}
