package com.organice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "proveedor_producto")
@Data
@NoArgsConstructor
public class ProveedorProducto {

    @EmbeddedId
    private ProveedorProductoId id = new ProveedorProductoId();

    @ManyToOne
    @MapsId("proveedorId")
    @JoinColumn(name = "id_proveedor")
    private Proveedor proveedor;

    @ManyToOne
    @MapsId("productoId")
    @JoinColumn(name = "id_producto")
    private Producto producto;

    private Double precio = 0.0;

    @Embeddable
    @Data
    @NoArgsConstructor
    public static class ProveedorProductoId implements java.io.Serializable {
        @Column(name = "id_proveedor")
        private Integer proveedorId;

        @Column(name = "id_producto")
        private Integer productoId;
    }
}
