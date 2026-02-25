package com.organice.repository;

import com.organice.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    Optional<Proveedor> findByUsuario(String usuario);
    List<Proveedor> findByActivoTrue();
    boolean existsByUsuario(String usuario);
    boolean existsByRfc(String rfc);
}
