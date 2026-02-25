package com.organice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ordenes_compra")
@Data
@NoArgsConstructor
public class OrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    private LocalDateTime fecha = LocalDateTime.now();

    @Column(nullable = false)
    private String estado = "GUARDADA";

    private Double total = 0.0;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<DetalleOrden> detalles;
}
