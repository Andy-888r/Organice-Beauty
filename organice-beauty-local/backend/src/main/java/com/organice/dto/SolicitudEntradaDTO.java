package com.organice.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class SolicitudEntradaDTO {
    private Integer id;
    private Integer idProveedor;
    private String nombreProveedor;
    private Integer idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private LocalDateTime fecha;
    private String estado;
    private String motivo;
}
