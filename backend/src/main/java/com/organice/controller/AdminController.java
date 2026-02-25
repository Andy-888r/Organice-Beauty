package com.organice.controller;

import com.organice.model.*;
import com.organice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired private ClienteRepository clienteRepo;
    @Autowired private ProveedorRepository proveedorRepo;
    @Autowired private AdministradorRepository adminRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/clientes")
    public List<Cliente> clientes() { return clienteRepo.findAll(); }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Integer id) {
        clienteRepo.deleteById(id); return ResponseEntity.ok("Eliminado");
    }

    @GetMapping("/proveedores")
    public List<Proveedor> proveedores() { return proveedorRepo.findAll(); }

    @PutMapping("/proveedores/{id}")
    public ResponseEntity<?> actualizarProveedor(@PathVariable Integer id, @RequestBody Proveedor datos) {
        return proveedorRepo.findById(id).map(p -> {
            p.setNombre(datos.getNombre()); p.setRfc(datos.getRfc()); p.setEmpresa(datos.getEmpresa());
            p.setCorreo(datos.getCorreo()); p.setDireccion(datos.getDireccion());
            p.setTelefono(datos.getTelefono()); p.setActivo(datos.getActivo());
            return ResponseEntity.ok(proveedorRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/proveedores/{id}")
    public ResponseEntity<?> eliminarProveedor(@PathVariable Integer id) {
        proveedorRepo.deleteById(id); return ResponseEntity.ok("Eliminado");
    }

    @GetMapping("/admins")
    public List<Administrador> admins() { return adminRepo.findAll(); }

    @PostMapping("/admins")
    public ResponseEntity<?> crearAdmin(@RequestBody Administrador a) {
        a.setContrasena(passwordEncoder.encode(a.getContrasena()));
        return ResponseEntity.ok(adminRepo.save(a));
    }
}
