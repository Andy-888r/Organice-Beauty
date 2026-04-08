package com.organice.controller;
 
import com.organice.model.*;
import com.organice.repository.*;
import com.organice.service.LocalStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
 
@RestController
@RequestMapping("/admin")
public class AdminController {
 
    @Autowired private ClienteRepository clienteRepo;
    @Autowired private ProveedorRepository proveedorRepo;
    @Autowired private AdministradorRepository adminRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private LocalStorageService storageService;
    @Autowired private ObjectMapper objectMapper;
 
    // ── Clientes ──
    @GetMapping("/clientes")
    public List<Cliente> clientes() { return clienteRepo.findAll(); }
 
    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Integer id) {
        clienteRepo.deleteById(id); return ResponseEntity.ok("Eliminado");
    }
 
    // ── Proveedores ──
    @GetMapping("/proveedores")
    public List<Proveedor> proveedores() { return proveedorRepo.findAll(); }
 
    @PostMapping(value = "/proveedores", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearProveedor(
            @RequestPart("proveedor") String json,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        try {
            Proveedor p = objectMapper.readValue(json, Proveedor.class);
            if (logo != null && !logo.isEmpty()) {
                p.setLogoPath(storageService.guardarImagen(logo));
            }
            return ResponseEntity.ok(proveedorRepo.save(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
 
    @PutMapping(value = "/proveedores/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarProveedor(
            @PathVariable Integer id,
            @RequestPart("proveedor") String json,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        try {
            Proveedor existente = proveedorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
            Proveedor datos = objectMapper.readValue(json, Proveedor.class);
            existente.setNombre(datos.getNombre());
            existente.setEmpresa(datos.getEmpresa());
            existente.setUrl(datos.getUrl());       // ← reemplaza telefono/correo/descripcion
            existente.setActivo(datos.getActivo());
            if (logo != null && !logo.isEmpty()) {
                existente.setLogoPath(storageService.guardarImagen(logo));
            }
            return ResponseEntity.ok(proveedorRepo.save(existente));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
 
    @DeleteMapping("/proveedores/{id}")
    public ResponseEntity<?> eliminarProveedor(@PathVariable Integer id) {
        proveedorRepo.deleteById(id); return ResponseEntity.ok("Eliminado");
    }
 
    // ── Admins ──
    @GetMapping("/admins")
    public List<Administrador> admins() { return adminRepo.findAll(); }
 
    @PostMapping("/admins")
    public ResponseEntity<?> crearAdmin(@RequestBody Administrador a) {
        a.setContrasena(passwordEncoder.encode(a.getContrasena()));
        return ResponseEntity.ok(adminRepo.save(a));
    }
}