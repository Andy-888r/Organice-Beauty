package com.organice.controller;

import com.organice.model.Producto;
import com.organice.model.Proveedor;
import com.organice.repository.ProductoRepository;
import com.organice.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/proveedor")
public class ProveedorController {
    @Autowired private ProveedorRepository proveedorRepo;
    @Autowired private ProductoRepository productoRepo;

    @GetMapping("/{id}")
    public ResponseEntity<?> perfil(@PathVariable Integer id) {
        return proveedorRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Proveedor datos) {
        return proveedorRepo.findById(id).map(p -> {
            p.setNombre(datos.getNombre()); p.setEmpresa(datos.getEmpresa());
            p.setTelefono(datos.getTelefono()); p.setCorreo(datos.getCorreo());
            p.setDireccion(datos.getDireccion());
            return ResponseEntity.ok(proveedorRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/productos")
    public List<Producto> productos(@PathVariable Integer id) {
        return productoRepo.findByProveedorId(id);
    }
}
