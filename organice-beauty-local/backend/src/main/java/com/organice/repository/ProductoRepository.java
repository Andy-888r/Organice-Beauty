package com.organice.repository;

import com.organice.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByActivoTrue();
    List<Producto> findByCategoria(String categoria);
    List<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);

    @Query("SELECT p FROM Producto p JOIN ProveedorProducto pp ON pp.producto.id = p.id WHERE pp.proveedor.id = :idProveedor AND p.activo = true")
    List<Producto> findByProveedorId(@Param("idProveedor") Integer idProveedor);
}
