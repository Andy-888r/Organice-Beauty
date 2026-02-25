package com.organice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.organice.dto.CompraRequest;
import com.organice.model.*;
import com.organice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompraService {

    @Autowired private ClienteRepository clienteRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private HistorialCompraRepository historialCompraRepo;
    @Autowired private InventarioRepository inventarioRepo;
    @Autowired private HistorialMovimientoRepository movimientoRepo;

    // =============================================
    // PROCESAR COMPRA + descontar inventario
    // =============================================
    @Transactional
    public double procesarCompra(CompraRequest req) {
        Cliente cliente = null;
        if (req.getIdCliente() != null) {
            cliente = clienteRepo.findById(req.getIdCliente()).orElse(null);
        }

        double total = 0;

        for (CompraRequest.ItemCompra item : req.getItems()) {
            Producto prod = productoRepo.findById(item.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + item.getIdProducto()));

            double subtotal = item.getPrecio() * item.getCantidad();
            total += subtotal;

            // Guardar historial
            HistorialCompra hc = new HistorialCompra();
            hc.setCliente(cliente);
            hc.setProducto(prod);
            hc.setCantidad(item.getCantidad());
            hc.setTotal(subtotal);
            hc.setFecha(LocalDateTime.now());
            historialCompraRepo.save(hc);

            // Descontar del inventario
            inventarioRepo.findByProductoId(prod.getId()).ifPresent(inv -> {
                int nuevoStock = Math.max(0, inv.getStock() - item.getCantidad());
                inv.setStock(nuevoStock);
                inv.setEstado(nuevoStock == 0 ? "SIN STOCK" : nuevoStock <= inv.getMinimo() ? "BAJO" : "OK");
                inventarioRepo.save(inv);

                HistorialMovimiento mov = new HistorialMovimiento();
                mov.setProducto(prod);
                mov.setTipo("Salida");
                mov.setCantidad(item.getCantidad());
                mov.setMotivo("Venta a cliente");
                mov.setFecha(LocalDateTime.now());
                movimientoRepo.save(mov);
            });
        }

        return total;
    }

    // =============================================
    // GENERAR TICKET PDF — ORGANICE BEAUTY
    // =============================================
    public byte[] generarTicketPDF(String nombreCliente,
                                    List<CompraRequest.ItemCompra> items,
                                    List<String> nombresProductos,
                                    double total) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // ── Página tamaño carta con márgenes amplios ──
            Document doc = new Document(PageSize.LETTER, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Colores del tema ──
            java.awt.Color ROSA         = new java.awt.Color(194, 24, 91);   // #C2185B
            java.awt.Color ROSA_CLARO   = new java.awt.Color(252, 228, 236); // #FCE4EC
            java.awt.Color GRIS_OSCURO  = new java.awt.Color(66, 66, 66);    // #424242
            java.awt.Color GRIS_CLARO   = new java.awt.Color(245, 245, 245); // #F5F5F5
            java.awt.Color GRIS_LINEA   = new java.awt.Color(220, 220, 220); // #DCDCDC
            java.awt.Color AZUL_BORDE   = new java.awt.Color(180, 190, 210); // borde decorativo

            // ── Fuentes ──
            Font fLogoGrande  = new Font(Font.HELVETICA, 20, Font.BOLD,   ROSA);
            Font fLogoChico   = new Font(Font.HELVETICA,  8, Font.NORMAL, GRIS_OSCURO);
            Font fTituloDoc   = new Font(Font.HELVETICA, 22, Font.BOLD,   GRIS_OSCURO);
            Font fNumero      = new Font(Font.HELVETICA,  9, Font.NORMAL, GRIS_OSCURO);
            Font fLabel       = new Font(Font.HELVETICA,  8, Font.BOLD,   GRIS_OSCURO);
            Font fTexto       = new Font(Font.HELVETICA,  9, Font.NORMAL, GRIS_OSCURO);
            Font fEncabezado  = new Font(Font.HELVETICA,  9, Font.BOLD,   java.awt.Color.WHITE);
            Font fCelda       = new Font(Font.HELVETICA,  9, Font.NORMAL, GRIS_OSCURO);
            Font fTotalLabel  = new Font(Font.HELVETICA, 10, Font.BOLD,   GRIS_OSCURO);
            Font fTotalValor  = new Font(Font.HELVETICA, 10, Font.BOLD,   ROSA);
            Font fPie         = new Font(Font.HELVETICA,  8, Font.NORMAL, new java.awt.Color(150,150,150));

            // ── Fecha formateada ──
            String fecha = LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy",
                    new java.util.Locale("es", "MX")));
            String hora  = LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
            String folio = "OB-" + System.currentTimeMillis() % 100000;

            PdfContentByte canvas = writer.getDirectContent();
            float pageW = PageSize.LETTER.getWidth();
            float pageH = PageSize.LETTER.getHeight();

            // ── Borde decorativo doble (igual que la referencia) ──
            // Borde exterior
            canvas.setColorStroke(AZUL_BORDE);
            canvas.setLineWidth(2f);
            canvas.rectangle(25, 25, pageW - 50, pageH - 50);
            canvas.stroke();
            // Borde interior
            canvas.setLineWidth(0.5f);
            canvas.rectangle(30, 30, pageW - 60, pageH - 60);
            canvas.stroke();

            // ══════════════════════════════════════
            // ENCABEZADO: Logo izquierda + FACTURA derecha
            // ══════════════════════════════════════
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{45, 55});
            header.setSpacingAfter(20f);

            // Celda logo con recuadro rosa
            PdfPCell celdaLogo = new PdfPCell();
            celdaLogo.setBorderColor(ROSA);
            celdaLogo.setBorderWidth(1.5f);
            celdaLogo.setPadding(12f);
            celdaLogo.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph pLogo = new Paragraph();
            pLogo.add(new Chunk("ORGANICE\n", fLogoGrande));
            pLogo.add(new Chunk("BEAUTY", fLogoGrande));
            pLogo.setAlignment(Element.ALIGN_CENTER);
            celdaLogo.addElement(pLogo);
            Paragraph pSub = new Paragraph("TIENDA DE BELLEZA", fLogoChico);
            pSub.setAlignment(Element.ALIGN_CENTER);
            celdaLogo.addElement(pSub);
            header.addCell(celdaLogo);

            // Celda título TICKET / folio
            PdfPCell celdaTitulo = new PdfPCell();
            celdaTitulo.setBorder(Rectangle.NO_BORDER);
            celdaTitulo.setPaddingLeft(20f);
            celdaTitulo.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph pTitulo = new Paragraph("TICKET DE COMPRA", fTituloDoc);
            pTitulo.setAlignment(Element.ALIGN_RIGHT);
            celdaTitulo.addElement(pTitulo);
            Paragraph pFolio = new Paragraph("FOLIO: #" + folio, fNumero);
            pFolio.setAlignment(Element.ALIGN_RIGHT);
            celdaTitulo.addElement(pFolio);
            header.addCell(celdaTitulo);

            doc.add(header);

            // ── Línea separadora rosa ──
            PdfPTable lineaSep = new PdfPTable(1);
            lineaSep.setWidthPercentage(100);
            lineaSep.setSpacingAfter(16f);
            PdfPCell lineaCell = new PdfPCell(new Phrase(" "));
            lineaCell.setBackgroundColor(ROSA);
            lineaCell.setFixedHeight(2f);
            lineaCell.setBorder(Rectangle.NO_BORDER);
            lineaSep.addCell(lineaCell);
            doc.add(lineaSep);

            // ══════════════════════════════════════
            // SECCIÓN: CLIENTE + FECHA (2 columnas)
            // ══════════════════════════════════════
            PdfPTable infoSection = new PdfPTable(2);
            infoSection.setWidthPercentage(100);
            infoSection.setWidths(new float[]{50, 50});
            infoSection.setSpacingAfter(20f);

            // Columna izquierda: datos del cliente
            PdfPCell cCliente = new PdfPCell();
            cCliente.setBorder(Rectangle.NO_BORDER);
            cCliente.setPaddingBottom(8f);
            cCliente.addElement(new Paragraph("FACTURADO A", fLabel));
            agregarLineaDelgada(cCliente, ROSA);
            cCliente.addElement(new Paragraph(
                nombreCliente != null ? nombreCliente : "Cliente", fTexto));
            cCliente.addElement(new Paragraph("Organice Beauty — Cliente registrado", fTexto));
            infoSection.addCell(cCliente);

            // Columna derecha: fecha y hora
            PdfPCell cFecha = new PdfPCell();
            cFecha.setBorder(Rectangle.NO_BORDER);
            cFecha.setPaddingBottom(8f);
            cFecha.addElement(new Paragraph("FECHA DE COMPRA", fLabel));
            agregarLineaDelgada(cFecha, ROSA);
            cFecha.addElement(new Paragraph(fecha, fTexto));
            cFecha.addElement(new Paragraph("Hora: " + hora, fTexto));
            infoSection.addCell(cFecha);

            doc.add(infoSection);

            // ══════════════════════════════════════
            // TABLA DE PRODUCTOS
            // ══════════════════════════════════════
            PdfPTable tabla = new PdfPTable(4);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{45, 15, 20, 20});
            tabla.setSpacingAfter(0f);

            // Encabezados con fondo rosa
            String[] encabezados = {"DESCRIPCIÓN", "CANT.", "PRECIO UNIT.", "TOTAL"};
            for (String enc : encabezados) {
                PdfPCell ch = new PdfPCell(new Phrase(enc, fEncabezado));
                ch.setBackgroundColor(ROSA);
                ch.setPadding(7f);
                ch.setBorderColor(ROSA);
                ch.setHorizontalAlignment(enc.equals("DESCRIPCIÓN") ?
                    Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
                tabla.addCell(ch);
            }

            // Filas de productos
            for (int i = 0; i < items.size(); i++) {
                CompraRequest.ItemCompra item = items.get(i);
                String nombre = i < nombresProductos.size() ? nombresProductos.get(i) : "Producto";
                double subtotal = item.getPrecio() * item.getCantidad();
                java.awt.Color bgFila = (i % 2 == 0) ? java.awt.Color.WHITE : GRIS_CLARO;

                PdfPCell cNombre = new PdfPCell(new Phrase(nombre, fCelda));
                cNombre.setBackgroundColor(bgFila);
                cNombre.setPadding(6f);
                cNombre.setBorderColor(GRIS_LINEA);
                cNombre.setHorizontalAlignment(Element.ALIGN_LEFT);
                tabla.addCell(cNombre);

                PdfPCell cCant = new PdfPCell(new Phrase(String.valueOf(item.getCantidad()), fCelda));
                cCant.setBackgroundColor(bgFila);
                cCant.setPadding(6f);
                cCant.setBorderColor(GRIS_LINEA);
                cCant.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tabla.addCell(cCant);

                PdfPCell cPrecio = new PdfPCell(new Phrase("$" + String.format("%.2f", item.getPrecio()), fCelda));
                cPrecio.setBackgroundColor(bgFila);
                cPrecio.setPadding(6f);
                cPrecio.setBorderColor(GRIS_LINEA);
                cPrecio.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tabla.addCell(cPrecio);

                PdfPCell cSub = new PdfPCell(new Phrase("$" + String.format("%.2f", subtotal), fCelda));
                cSub.setBackgroundColor(bgFila);
                cSub.setPadding(6f);
                cSub.setBorderColor(GRIS_LINEA);
                cSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tabla.addCell(cSub);
            }
            doc.add(tabla);

            // ══════════════════════════════════════
            // TOTALES (alineados a la derecha)
            // ══════════════════════════════════════
            PdfPTable totales = new PdfPTable(2);
            totales.setWidthPercentage(45);
            totales.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totales.setWidths(new float[]{55, 45});
            totales.setSpacingBefore(0f);
            totales.setSpacingAfter(24f);

            // Subtotal
            agregarFilaTotales(totales, "SUBTOTAL", "$" + String.format("%.2f", total),
                fTotalLabel, fCelda, GRIS_CLARO, GRIS_LINEA, false);
            // IVA (16%)
            double iva = total * 0.16;
            agregarFilaTotales(totales, "IVA (16%)", "$" + String.format("%.2f", iva),
                fTotalLabel, fCelda, java.awt.Color.WHITE, GRIS_LINEA, false);
            // Total con fondo rosa
            agregarFilaTotales(totales, "TOTAL", "$" + String.format("%.2f", total + iva),
                fTotalValor, fTotalValor, ROSA_CLARO, ROSA, true);

            doc.add(totales);

            // ── Línea separadora rosa ──
            doc.add(lineaSep);

            // ══════════════════════════════════════
            // PIE DE PÁGINA
            // ══════════════════════════════════════
            PdfPTable pie = new PdfPTable(2);
            pie.setWidthPercentage(100);
            pie.setWidths(new float[]{50, 50});
            pie.setSpacingBefore(12f);

            PdfPCell cContacto = new PdfPCell();
            cContacto.setBorder(Rectangle.NO_BORDER);
            cContacto.addElement(new Paragraph("CONTACTO", fLabel));
            cContacto.addElement(new Paragraph("organicebeauty@email.com", fPie));
            cContacto.addElement(new Paragraph("www.organicebeauty.com", fPie));
            pie.addCell(cContacto);

            PdfPCell cGracias = new PdfPCell();
            cGracias.setBorder(Rectangle.NO_BORDER);
            cGracias.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph pGracias = new Paragraph("¡Gracias por tu compra!", fPie);
            pGracias.setAlignment(Element.ALIGN_RIGHT);
            cGracias.addElement(pGracias);
            Paragraph pPolitica = new Paragraph(
                "Cambios y devoluciones dentro de 30 días\ncon ticket de compra.", fPie);
            pPolitica.setAlignment(Element.ALIGN_RIGHT);
            cGracias.addElement(pPolitica);
            pie.addCell(cGracias);

            doc.add(pie);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando ticket PDF: " + e.getMessage());
        }
    }

    // ── Helper: línea delgada de color dentro de una celda ──
    private void agregarLineaDelgada(PdfPCell celda, java.awt.Color color) {
        PdfPTable linea = new PdfPTable(1);
        try { linea.setWidths(new float[]{1}); } catch (Exception ignored) {}
        PdfPCell lc = new PdfPCell(new Phrase(" "));
        lc.setFixedHeight(1.5f);
        lc.setBackgroundColor(color);
        lc.setBorder(Rectangle.NO_BORDER);
        linea.addCell(lc);
        celda.addElement(linea);
        celda.addElement(new Paragraph(" ", new Font(Font.HELVETICA, 4)));
    }

    // ── Helper: fila de totales ──
    private void agregarFilaTotales(PdfPTable tabla, String label, String valor,
                                     Font fLabel, Font fValor,
                                     java.awt.Color bg, java.awt.Color borderColor,
                                     boolean negrita) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, fLabel));
        cLabel.setBackgroundColor(bg);
        cLabel.setPadding(6f);
        cLabel.setBorderColor(borderColor);
        cLabel.setHorizontalAlignment(Element.ALIGN_LEFT);
        tabla.addCell(cLabel);

        PdfPCell cValor = new PdfPCell(new Phrase(valor, fValor));
        cValor.setBackgroundColor(bg);
        cValor.setPadding(6f);
        cValor.setBorderColor(borderColor);
        cValor.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tabla.addCell(cValor);
    }

    private void agregarCelda(PdfPTable table, String texto, boolean encabezado) {
        PdfPCell celda = new PdfPCell(new Phrase(texto,
                new Font(Font.HELVETICA, encabezado ? 12 : 10,
                        encabezado ? Font.BOLD : Font.NORMAL)));
        celda.setHorizontalAlignment(Element.ALIGN_CENTER);
        celda.setBorderWidth(encabezado ? 1.5f : 1f);
        table.addCell(celda);
    }
}
