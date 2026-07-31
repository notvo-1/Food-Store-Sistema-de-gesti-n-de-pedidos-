package com.tp.jpa.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@Entity
@Table(name = "producto")
public class Producto extends Base {
    @EqualsAndHashCode.Include
    private String nombre;

    private Double precio;
    private String descripcion;
    private int stock;
    private String imagen;
    private boolean disponible;
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

}
