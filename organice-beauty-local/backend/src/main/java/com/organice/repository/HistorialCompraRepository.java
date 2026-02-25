package com.organice.repository;

import com.organice.model.HistorialCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialCompraRepository extends JpaRepository<HistorialCompra, Integer> {
    List<HistorialCompra> findByClienteIdOrderByFechaDesc(Integer clienteId);
}
