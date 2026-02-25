package com.organice.repository;

import com.organice.model.ProveedorProducto;
import com.organice.model.ProveedorProducto.ProveedorProductoId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProveedorProductoRepository extends JpaRepository<ProveedorProducto, ProveedorProductoId> {
    List<ProveedorProducto> findByProveedorId(Integer proveedorId);
    List<ProveedorProducto> findByProductoId(Integer productoId);
    boolean existsByProveedorIdAndProductoId(Integer proveedorId, Integer productoId);
    void deleteByProveedorIdAndProductoId(Integer proveedorId, Integer productoId);
}
