package com.organice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String rol;
    private Integer id;
    private String nombre;
}
