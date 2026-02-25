package com.organice.service;

import com.organice.dto.LoginRequest;
import com.organice.dto.LoginResponse;
import com.organice.model.Administrador;
import com.organice.model.Cliente;
import com.organice.model.Proveedor;
import com.organice.repository.AdministradorRepository;
import com.organice.repository.ClienteRepository;
import com.organice.repository.ProveedorRepository;
import com.organice.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private AdministradorRepository adminRepo;
    @Autowired private ClienteRepository clienteRepo;
    @Autowired private ProveedorRepository proveedorRepo;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    /**
     * Login unificado - detecta el rol automáticamente.
     * Primero busca en admins, luego proveedores, luego clientes.
     */
    public LoginResponse login(LoginRequest req) {

        // 1. Buscar como ADMIN
        var adminOpt = adminRepo.findByUsuarioAndActivoTrue(req.getUsuario());
        if (adminOpt.isPresent()) {
            Administrador a = adminOpt.get();
            if (passwordEncoder.matches(req.getContrasena(), a.getContrasena())) {
                String token = jwtUtil.generateToken(a.getUsuario(), "ADMIN", a.getId());
                return new LoginResponse(token, "ADMIN", a.getId(), a.getNombre());
            }
        }

        // 2. Buscar como PROVEEDOR
        var provOpt = proveedorRepo.findByUsuario(req.getUsuario());
        if (provOpt.isPresent()) {
            Proveedor p = provOpt.get();
            if (p.getActivo() && passwordEncoder.matches(req.getContrasena(), p.getContrasena())) {
                String token = jwtUtil.generateToken(p.getUsuario(), "PROVEEDOR", p.getId());
                return new LoginResponse(token, "PROVEEDOR", p.getId(), p.getNombre());
            }
        }

        // 3. Buscar como CLIENTE
        var clienteOpt = clienteRepo.findByUsuario(req.getUsuario());
        if (clienteOpt.isPresent()) {
            Cliente c = clienteOpt.get();
            if (passwordEncoder.matches(req.getContrasena(), c.getContrasena())) {
                String token = jwtUtil.generateToken(c.getUsuario(), "CLIENTE", c.getId());
                return new LoginResponse(token, "CLIENTE", c.getId(), c.getNombreCompleto());
            }
        }

        throw new RuntimeException("Usuario o contraseña incorrectos");
    }

    public LoginResponse registrarCliente(Cliente cliente) {
        if (clienteRepo.existsByUsuario(cliente.getUsuario())) {
            throw new RuntimeException("El usuario ya existe");
        }
        cliente.setContrasena(passwordEncoder.encode(cliente.getContrasena()));
        Cliente saved = clienteRepo.save(cliente);
        String token = jwtUtil.generateToken(saved.getUsuario(), "CLIENTE", saved.getId());
        return new LoginResponse(token, "CLIENTE", saved.getId(), saved.getNombreCompleto());
    }

    public LoginResponse registrarProveedor(Proveedor proveedor) {
        if (proveedorRepo.existsByUsuario(proveedor.getUsuario())) {
            throw new RuntimeException("El usuario de proveedor ya existe");
        }
        proveedor.setContrasena(passwordEncoder.encode(proveedor.getContrasena()));
        proveedor.setActivo(true);
        Proveedor saved = proveedorRepo.save(proveedor);
        String token = jwtUtil.generateToken(saved.getUsuario(), "PROVEEDOR", saved.getId());
        return new LoginResponse(token, "PROVEEDOR", saved.getId(), saved.getNombre());
    }
}
