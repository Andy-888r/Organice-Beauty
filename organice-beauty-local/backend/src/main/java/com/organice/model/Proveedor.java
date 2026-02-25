package com.organice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "proveedores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @Column(unique = true)
    private String rfc;

    @Column(nullable = false, unique = true)
    private String usuario;

    @Column(nullable = false)
    private String contrasena;

    private String empresa;
    private String telefono;
    private String correo;
    private String direccion;

    @Column(nullable = false)
    private Boolean activo = true;
}
