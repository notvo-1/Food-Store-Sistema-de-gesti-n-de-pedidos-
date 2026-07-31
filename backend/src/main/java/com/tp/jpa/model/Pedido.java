package com.tp.jpa.model;

import jakarta.persistence.*;
import lombok.*;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
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
@Table(name = "pedido")
public class Pedido extends Base implements Calculable {
    private LocalDate fecha;
    @Enumerated(EnumType.STRING)
    private Estado estado;
    private Double total;
    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pago")
    private FormaPago formaPago;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;


    @Builder.Default
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id")
    private Set<DetallePedido> detallePedido = new HashSet<>();

    @Override
    public void calcularTotal() {
        this.total = this.detallePedido.stream()
                .map(DetallePedido::getSubtotal)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    public void addDetallePedido(int cantidad, Producto producto){
        double subtotalDetalle = cantidad * producto.getPrecio();

        DetallePedido nuevoDetalle = DetallePedido.builder()
                .cantidad(cantidad)
                .subtotal(subtotalDetalle)
                .producto(producto)
                .eliminado(false)
                .build();

        this.detallePedido.add(nuevoDetalle);
        calcularTotal();
    }

    public DetallePedido findDetallePedidoByProducto(Producto producto) {
        if (this.detallePedido == null) return null;

        return this.detallePedido.stream()
                .filter(dp -> dp.getProducto() != null && dp.getProducto().equals(producto))
                .findFirst()
                .orElse(null);
    }

    public void deteleDetallePedidoByProducto(Producto producto) {
        if (this.detallePedido != null) {
            boolean eliminado = this.detallePedido.removeIf(dp ->
                    dp.getProducto() != null && dp.getProducto().equals(producto)
            );

            if (eliminado) {
                calcularTotal();
            }
        }
    }

    public int obtenerCantidadItems() {
        return (this.detallePedido == null) ? 0 : this.detallePedido.stream()
                .mapToInt(DetallePedido::getCantidad)
                .sum();
    }
}
