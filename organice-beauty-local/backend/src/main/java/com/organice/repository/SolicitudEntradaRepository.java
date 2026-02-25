package com.organice.repository;

import com.organice.model.SolicitudEntrada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudEntradaRepository extends JpaRepository<SolicitudEntrada, Integer> {
    List<SolicitudEntrada> findByProveedorIdOrderByFechaDesc(Integer proveedorId);
    List<SolicitudEntrada> findByEstadoOrderByFechaAsc(String estado);
    long countByEstado(String estado);
}
