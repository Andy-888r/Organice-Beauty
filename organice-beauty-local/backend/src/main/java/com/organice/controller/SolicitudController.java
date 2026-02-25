package com.organice.controller;

import com.organice.dto.SolicitudEntradaDTO;
import com.organice.service.SolicitudEntradaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
public class SolicitudController {
    @Autowired private SolicitudEntradaService service;

    @PostMapping("/proveedor/solicitudes")
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(service.crearSolicitud(
                (Integer) body.get("idProveedor"), (Integer) body.get("idProducto"),
                (Integer) body.get("cantidad"), (String) body.get("motivo")));
        } catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/proveedor/{id}/solicitudes")
    public List<SolicitudEntradaDTO> porProveedor(@PathVariable Integer id) { return service.listarPorProveedor(id); }

    @GetMapping("/admin/solicitudes/pendientes")
    public List<SolicitudEntradaDTO> pendientes() { return service.listarPendientes(); }

    @GetMapping("/admin/solicitudes/pendientes/count")
    public Map<String, Long> count() { return Map.of("total", service.contarPendientes()); }

    @PutMapping("/admin/solicitudes/{id}/aprobar")
    public ResponseEntity<?> aprobar(@PathVariable Integer id) {
        try { return ResponseEntity.ok(service.aprobarSolicitud(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PutMapping("/admin/solicitudes/{id}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable Integer id) { return ResponseEntity.ok(service.rechazarSolicitud(id)); }
}
