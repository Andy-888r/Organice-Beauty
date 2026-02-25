package com.organice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String usuario;

    @Column(nullable = false)
    private String contrasena;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    private String telefono;
    private String correo;
    private String direccion;

    @Column(columnDefinition = "TEXT")
    private String preferencias;
}
