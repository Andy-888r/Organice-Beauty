package com.organice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List; 
@Data @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String rol;
    private Integer id;
    private String nombre;
    private List<String> alertas;
}