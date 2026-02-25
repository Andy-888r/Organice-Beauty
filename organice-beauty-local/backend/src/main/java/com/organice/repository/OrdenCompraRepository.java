package com.organice.repository;

import com.organice.model.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Integer> {
    List<OrdenCompra> findByProveedorIdOrderByFechaDesc(Integer proveedorId);
    List<OrdenCompra> findByProveedorIdAndEstado(Integer proveedorId, String estado);
}
