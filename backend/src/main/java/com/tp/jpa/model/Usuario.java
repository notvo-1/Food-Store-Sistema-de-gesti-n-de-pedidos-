package com.tp.jpa.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import com.tp.jpa.model.enums.Rol;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "usuario")
public class Usuario extends Base {
    private String nombre;
    private String apellido;
    private String email;
    private String celular;
    private String contrasenia;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @Builder.Default
    private Set<Pedido> pedidos = new HashSet<>();

//    public Set<Pedido> getPedidos() {
//        if (this.pedidos == null) {
//            this.pedidos = new HashSet<>();
//        }
//        return this.pedidos;
//    }
}
