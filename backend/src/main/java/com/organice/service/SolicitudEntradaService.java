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
    @Autowired private ProveedorRepository proveedorRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private InventarioRepository inventarioRepo;
    @Autowired private HistorialMovimientoRepository movimientoRepo;
    @Autowired private HistorialCompraRepository historialCompraRepo;

    // =============================================
    // CREAR SOLICITUD (Proveedor)
    // =============================================
    public SolicitudEntrada crearSolicitud(Integer idProveedor, Integer idProducto,
                                            Integer cantidad, String motivo) {
        Proveedor prov = proveedorRepo.findById(idProveedor)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        Producto prod = productoRepo.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        SolicitudEntrada s = new SolicitudEntrada();
        s.setProveedor(prov);
        s.setProducto(prod);
        s.setCantidad(cantidad);
        s.setMotivo(motivo != null ? motivo : "Solicitud de proveedor");
        s.setEstado("Pendiente");
        s.setFecha(LocalDateTime.now());

        return solicitudRepo.save(s);
    }

    // =============================================
    // LISTAR POR PROVEEDOR
    // =============================================
    public List<SolicitudEntradaDTO> listarPorProveedor(Integer idProveedor) {
        return solicitudRepo.findByProveedorIdOrderByFechaDesc(idProveedor)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // =============================================
    // LISTAR PENDIENTES (Admin)
    // =============================================
    public List<SolicitudEntradaDTO> listarPendientes() {
        return solicitudRepo.findByEstadoOrderByFechaAsc("Pendiente")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long contarPendientes() {
        return solicitudRepo.countByEstado("Pendiente");
    }

    // =============================================
    // APROBAR SOLICITUD (Admin) - Lógica completa
    // Migrado de registrarEntradaCompleta del proyecto original
    // =============================================
    @Transactional
    public SolicitudEntrada aprobarSolicitud(Integer idSolicitud) {
        SolicitudEntrada s = solicitudRepo.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!"Pendiente".equals(s.getEstado())) {
            throw new RuntimeException("La solicitud no está pendiente");
        }

        Producto producto = s.getProducto();
        int cantidad = s.getCantidad();

        // 1. Actualizar inventario
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

        // 2. Registrar movimiento en historial
        HistorialMovimiento mov = new HistorialMovimiento();
        mov.setProducto(producto);
        mov.setTipo("Entrada");
        mov.setCantidad(cantidad);
        mov.setMotivo("Entrada aprobada por el administrador");
        mov.setFecha(LocalDateTime.now());
        movimientoRepo.save(mov);

        // 3. Registrar en historial de compras
        HistorialCompra hc = new HistorialCompra();
        hc.setProducto(producto);
        hc.setProveedor(s.getProveedor());
        hc.setCantidad(cantidad);
        hc.setTotal(producto.getPrecio() * cantidad);
        hc.setFecha(LocalDateTime.now());
        historialCompraRepo.save(hc);

        // 4. Activar producto automáticamente si estaba inactivo
        producto.setActivo(true);
        productoRepo.save(producto);

        // 5. Marcar solicitud como aprobada
        s.setEstado("Aprobada");
        return solicitudRepo.save(s);
    }

    // =============================================
    // RECHAZAR SOLICITUD (Admin)
    // =============================================
    public SolicitudEntrada rechazarSolicitud(Integer idSolicitud) {
        SolicitudEntrada s = solicitudRepo.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        s.setEstado("Rechazada");
        return solicitudRepo.save(s);
    }

    // =============================================
    // Conversión a DTO
    // =============================================
    private SolicitudEntradaDTO toDTO(SolicitudEntrada s) {
        SolicitudEntradaDTO dto = new SolicitudEntradaDTO();
        dto.setId(s.getId());
        dto.setIdProveedor(s.getProveedor().getId());
        dto.setNombreProveedor(s.getProveedor().getNombre());
        dto.setIdProducto(s.getProducto().getId());
        dto.setNombreProducto(s.getProducto().getNombre());
        dto.setCantidad(s.getCantidad());
        dto.setFecha(s.getFecha());
        dto.setEstado(s.getEstado());
        dto.setMotivo(s.getMotivo());
        return dto;
    }
}
