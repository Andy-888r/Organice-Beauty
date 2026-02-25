package com.organice.controller;

import com.organice.dto.LoginRequest;
import com.organice.model.Cliente;
import com.organice.model.Proveedor;
import com.organice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try { return ResponseEntity.ok(authService.login(req)); }
        catch (RuntimeException e) { return ResponseEntity.status(401).body(e.getMessage()); }
    }

    @PostMapping("/registro/cliente")
    public ResponseEntity<?> registrarCliente(@RequestBody Cliente c) {
        try { return ResponseEntity.ok(authService.registrarCliente(c)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/registro/proveedor")
    public ResponseEntity<?> registrarProveedor(@RequestBody Proveedor p) {
        try { return ResponseEntity.ok(authService.registrarProveedor(p)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}
