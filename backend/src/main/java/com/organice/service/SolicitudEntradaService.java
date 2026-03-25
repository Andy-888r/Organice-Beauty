package com.organice.service;

import com.organice.dto.SolicitudEntradaDTO;
import com.organice.model.*;
import com.organice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolicitudEntradaService {

    @Autowired private SolicitudEntradaRepository solicitudRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private InventarioRepository inventarioRepo;
    @Autowired private HistorialMovimientoRepository movimientoRepo;
    @Autowired private HistorialCompraRepository historialCompraRepo;

    public SolicitudEntrada crearSolicitud(Integer idProducto, Integer cantidad, String motivo) {
        Producto prod = productoRepo.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        SolicitudEntrada s = new SolicitudEntrada();
        s.setProducto(prod);
        s.setCantidad(cantidad);
        s.setMotivo(motivo != null ? motivo : "Solicitud de entrada");
        s.setEstado("Pendiente");
        s.setFecha(LocalDateTime.now());

        return solicitudRepo.save(s);
    }

    public List<SolicitudEntradaDTO> listarPendientes() {
        return solicitudRepo.findByEstadoOrderByFechaAsc("Pendiente")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long contarPendientes() {
        return solicitudRepo.countByEstado("Pendiente");
    }

    @Transactional
    public SolicitudEntrada aprobarSolicitud(Integer idSolicitud) {
        SolicitudEntrada s = solicitudRepo.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!"Pendiente".equals(s.getEstado())) {
            throw new RuntimeException("La solicitud no está pendiente");
        }

        Producto producto = s.getProducto();
        int cantidad = s.getCantidad();

        Inventario inv = inventarioRepo.findByProductoId(producto.getId())
                .orElseGet(() -> {
                    Inventario nuevo = new Inventario();
                    nuevo.setProducto(producto);
                    nuevo.setStock(0);
                    nuevo.setMinimo(5);
                    return nuevo;
                });

        int nuevoStock = inv.getStock() + cantidad;
        inv.setStock(nuevoStock);
        inv.setEstado(nuevoStock == 0 ? "SIN STOCK" : nuevoStock <= inv.getMinimo() ? "BAJO" : "OK");
        inventarioRepo.save(inv);

        HistorialMovimiento mov = new HistorialMovimiento();
        mov.setProducto(producto);
        mov.setTipo("Entrada");
        mov.setCantidad(cantidad);
        mov.setMotivo("Entrada aprobada por el administrador");
        mov.setFecha(LocalDateTime.now());
        movimientoRepo.save(mov);

        HistorialCompra hc = new HistorialCompra();
        hc.setProducto(producto);
        hc.setCantidad(cantidad);
        hc.setTotal(producto.getPrecio() * cantidad);
        hc.setFecha(LocalDateTime.now());
        historialCompraRepo.save(hc);

        producto.setActivo(true);
        productoRepo.save(producto);

        s.setEstado("Aprobada");
        return solicitudRepo.save(s);
    }

    public SolicitudEntrada rechazarSolicitud(Integer idSolicitud) {
        SolicitudEntrada s = solicitudRepo.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        s.setEstado("Rechazada");
        return solicitudRepo.save(s);
    }

    private SolicitudEntradaDTO toDTO(SolicitudEntrada s) {
        SolicitudEntradaDTO dto = new SolicitudEntradaDTO();
        dto.setId(s.getId());
        dto.setIdProducto(s.getProducto().getId());
        dto.setNombreProducto(s.getProducto().getNombre());
        dto.setCantidad(s.getCantidad());
        dto.setFecha(s.getFecha());
        dto.setEstado(s.getEstado());
        dto.setMotivo(s.getMotivo());
        return dto;
    }
}