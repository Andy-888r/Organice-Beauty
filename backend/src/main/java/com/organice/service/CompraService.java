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
import java.io.InputStream;
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

            HistorialCompra hc = new HistorialCompra();
            hc.setCliente(cliente);
            hc.setProducto(prod);
            hc.setCantidad(item.getCantidad());
            hc.setTotal(subtotal);
            hc.setFecha(LocalDateTime.now());
            historialCompraRepo.save(hc);

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
    // GENERAR TICKET PDF — ELITE BEAUTY
    // =============================================
    public byte[] generarTicketPDF(String nombreCliente,
                                    List<CompraRequest.ItemCompra> items,
                                    List<String> nombresProductos,
                                    double total) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.LETTER, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Paleta Elite Beauty ──
            java.awt.Color SIENNA       = new java.awt.Color(160, 82,  45);   // #A0522D — principal
            java.awt.Color CARAMELO     = new java.awt.Color(212, 149, 106);  // #D4956A — acento
            java.awt.Color BEIGE_HEADER = new java.awt.Color(245, 230, 216);  // #F5E6D8 — fondo encabezados tabla
            java.awt.Color BEIGE_CLARO  = new java.awt.Color(250, 247, 244);  // #FAF7F4 — fondo filas alternas
            java.awt.Color CAFE_TEXTO   = new java.awt.Color(61,  43,  38);   // #3d2b26 — texto principal
            java.awt.Color GRIS_LINEA   = new java.awt.Color(220, 205, 195);  // borde suave
            java.awt.Color NEGRO_CALIDO = new java.awt.Color(26,  18,  16);   // #1a1210 — fondo header

            // ── Fuentes ──
            // ── Fuentes ──
           Font fLogoNombre  = new Font(Font.HELVETICA, 18, Font.BOLD,   java.awt.Color.WHITE);
           Font fLogoSub     = new Font(Font.HELVETICA,  7, Font.NORMAL, CARAMELO);
           Font fTituloDoc   = new Font(Font.HELVETICA, 20, Font.BOLD,   CAFE_TEXTO);
           Font fNumero      = new Font(Font.HELVETICA,  9, Font.NORMAL, CARAMELO);
           Font fEncabezado  = new Font(Font.HELVETICA,  9, Font.BOLD,   java.awt.Color.WHITE);
           Font fCelda       = new Font(Font.HELVETICA,  9, Font.NORMAL, CAFE_TEXTO);
           Font fTotalLabel  = new Font(Font.HELVETICA, 10, Font.BOLD,   CAFE_TEXTO);
           Font fTotalFinal  = new Font(Font.HELVETICA, 11, Font.BOLD,   java.awt.Color.WHITE);

            String fecha = LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy",
                     new java.util.Locale.Builder().setLanguage("es").setRegion("MX").build()));
            String hora  = LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
            String folio = "EB-" + System.currentTimeMillis() % 100000;

            PdfContentByte canvas = writer.getDirectContent();
            float pageW = PageSize.LETTER.getWidth();
            float pageH = PageSize.LETTER.getHeight();

            // ── Borde exterior decorativo color sienna ──
            canvas.setColorStroke(CARAMELO);
            canvas.setLineWidth(2f);
            canvas.rectangle(22, 22, pageW - 44, pageH - 44);
            canvas.stroke();
            // Borde interior delgado
            canvas.setColorStroke(BEIGE_HEADER);
            canvas.setLineWidth(0.5f);
            canvas.rectangle(27, 27, pageW - 54, pageH - 54);
            canvas.stroke();

            // ══════════════════════════════════════
            // ENCABEZADO: fondo oscuro con logo + título
            // ══════════════════════════════════════
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{42, 58});
            header.setSpacingAfter(18f);

            // Celda izquierda — logo + nombre
            PdfPCell celdaLogo = new PdfPCell();
            celdaLogo.setBackgroundColor(NEGRO_CALIDO);
            celdaLogo.setBorder(Rectangle.NO_BORDER);
            celdaLogo.setPadding(14f);
            celdaLogo.setVerticalAlignment(Element.ALIGN_MIDDLE);

            // Intentar cargar el logo desde recursos del classpath
            PdfPTable logoInner = new PdfPTable(2);
            try { logoInner.setWidths(new float[]{1, 2}); } catch (Exception ignored) {}
            logoInner.setSplitRows(false);

            PdfPCell celdaImg = new PdfPCell();
            celdaImg.setBorder(Rectangle.NO_BORDER);
            celdaImg.setVerticalAlignment(Element.ALIGN_MIDDLE);
            celdaImg.setPaddingRight(8f);

            try {
                // Intentar cargar logo desde el classpath (colocar logo_elite_beauty.png en src/main/resources/static/)
                InputStream imgStream = getClass().getResourceAsStream("/static/logo_elite_beauty.png");
                if (imgStream == null) {
                    imgStream = getClass().getResourceAsStream("/logo_elite_beauty.png");
                }
                if (imgStream != null) {
                    Image logo = Image.getInstance(imgStream.readAllBytes());
                    logo.scaleToFit(52, 52);
                    celdaImg.addElement(logo);
                } else {
                    // Fallback: cuadro decorativo si no encuentra el logo
                    Paragraph pIcono = new Paragraph("EB", new Font(Font.HELVETICA, 14, Font.BOLD, CARAMELO));
                    pIcono.setAlignment(Element.ALIGN_CENTER);
                    celdaImg.addElement(pIcono);
                }
            } catch (Exception e) {
                Paragraph pIcono = new Paragraph("EB", new Font(Font.HELVETICA, 14, Font.BOLD, CARAMELO));
                pIcono.setAlignment(Element.ALIGN_CENTER);
                celdaImg.addElement(pIcono);
            }
            logoInner.addCell(celdaImg);

            PdfPCell celdaNombre = new PdfPCell();
            celdaNombre.setBorder(Rectangle.NO_BORDER);
            celdaNombre.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph pNombre = new Paragraph("ELITE\nBEAUTY", fLogoNombre);
            pNombre.setLeading(20f);
            celdaNombre.addElement(pNombre);
            Paragraph pSubtitulo = new Paragraph("TIENDA DE BELLEZA", fLogoSub);
            celdaNombre.addElement(pSubtitulo);
            logoInner.addCell(celdaNombre);

            celdaLogo.addElement(logoInner);
            header.addCell(celdaLogo);

            // Celda derecha — TICKET DE COMPRA + folio
            PdfPCell celdaTitulo = new PdfPCell();
            celdaTitulo.setBackgroundColor(BEIGE_HEADER);
            celdaTitulo.setBorder(Rectangle.NO_BORDER);
            celdaTitulo.setPaddingLeft(22f);
            celdaTitulo.setPaddingRight(14f);
            celdaTitulo.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph pTitulo = new Paragraph("TICKET DE COMPRA", fTituloDoc);
            pTitulo.setAlignment(Element.ALIGN_RIGHT);
            celdaTitulo.addElement(pTitulo);
            Paragraph pFolio = new Paragraph("FOLIO: #" + folio, fNumero);
            pFolio.setAlignment(Element.ALIGN_RIGHT);
            celdaTitulo.addElement(pFolio);
            header.addCell(celdaTitulo);

            doc.add(header);

            // ── Línea separadora sienna ──
            doc.add(lineaSeparadora(SIENNA));

            // ══════════════════════════════════════
            // SECCIÓN: CLIENTE + FECHA — Tarjetas beige (Opción A)
            // ══════════════════════════════════════
            java.awt.Color BEIGE_TARJETA = new java.awt.Color(245, 230, 216); // #F5E6D8
            java.awt.Color BORDE_TARJETA = new java.awt.Color(212, 149, 106); // #D4956A caramelo

            Font fTarjetaLabel = new Font(Font.HELVETICA,  7, Font.BOLD,   SIENNA);
            Font fTarjetaValor = new Font(Font.HELVETICA, 10, Font.BOLD,   CAFE_TEXTO);
            Font fTarjetaSub   = new Font(Font.HELVETICA,  8, Font.NORMAL, new java.awt.Color(120, 85, 65));

            PdfPTable infoSection = new PdfPTable(2);
            infoSection.setWidthPercentage(100);
            infoSection.setWidths(new float[]{50, 50});
            infoSection.setSpacingAfter(20f);
            infoSection.setSpacingBefore(6f);

            // ── Tarjeta izquierda: FACTURADO A ──
            PdfPCell cCliente = new PdfPCell();
            cCliente.setBackgroundColor(BEIGE_TARJETA);
            cCliente.setBorderColor(BORDE_TARJETA);
            cCliente.setBorderWidth(1.2f);
            cCliente.setPadding(14f);
            cCliente.setPaddingRight(12f);
            cCliente.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph pLabelCliente = new Paragraph("FACTURADO A", fTarjetaLabel);
            pLabelCliente.setSpacingAfter(5f);
            cCliente.addElement(pLabelCliente);

            // Línea decorativa sienna debajo del label
            PdfPTable lineaC = new PdfPTable(1);
            PdfPCell lcC = new PdfPCell(new Phrase(" "));
            lcC.setFixedHeight(1.5f); lcC.setBackgroundColor(SIENNA);
            lcC.setBorder(Rectangle.NO_BORDER);
            lineaC.addCell(lcC);
            cCliente.addElement(lineaC);
            cCliente.addElement(new Paragraph(" ", new Font(Font.HELVETICA, 3)));

            Paragraph pNombreCliente = new Paragraph(
                nombreCliente != null ? nombreCliente : "Cliente", fTarjetaValor);
            pNombreCliente.setSpacingBefore(5f);
            pNombreCliente.setSpacingAfter(2f);
            cCliente.addElement(pNombreCliente);
            cCliente.addElement(new Paragraph("Cliente registrado — Elite Beauty", fTarjetaSub));
            infoSection.addCell(cCliente);

            // ── Tarjeta derecha: FECHA DE COMPRA ──
            PdfPCell cFecha = new PdfPCell();
            cFecha.setBackgroundColor(BEIGE_TARJETA);
            cFecha.setBorderColor(BORDE_TARJETA);
            cFecha.setBorderWidth(1.2f);
            cFecha.setPadding(14f);
            cFecha.setPaddingLeft(12f);
            cFecha.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph pLabelFecha = new Paragraph("FECHA DE COMPRA", fTarjetaLabel);
            pLabelFecha.setSpacingAfter(5f);
            cFecha.addElement(pLabelFecha);

            PdfPTable lineaF = new PdfPTable(1);
            PdfPCell lcF = new PdfPCell(new Phrase(" "));
            lcF.setFixedHeight(1.5f); lcF.setBackgroundColor(SIENNA);
            lcF.setBorder(Rectangle.NO_BORDER);
            lineaF.addCell(lcF);
            cFecha.addElement(lineaF);
            cFecha.addElement(new Paragraph(" ", new Font(Font.HELVETICA, 3)));

            Paragraph pFechaVal = new Paragraph(fecha, fTarjetaValor);
            pFechaVal.setSpacingBefore(5f);
            pFechaVal.setSpacingAfter(2f);
            cFecha.addElement(pFechaVal);
            cFecha.addElement(new Paragraph("Hora: " + hora, fTarjetaSub));
            infoSection.addCell(cFecha);

            doc.add(infoSection);

            // ══════════════════════════════════════
            // TABLA DE PRODUCTOS
            // ══════════════════════════════════════
            PdfPTable tabla = new PdfPTable(4);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{45, 15, 20, 20});
            tabla.setSpacingAfter(0f);

            // Encabezados con fondo sienna
            String[] encabezados = {"DESCRIPCIÓN", "CANT.", "PRECIO UNIT.", "TOTAL"};
            for (String enc : encabezados) {
                PdfPCell ch = new PdfPCell(new Phrase(enc, fEncabezado));
                ch.setBackgroundColor(SIENNA);
                ch.setPadding(8f);
                ch.setBorderColor(SIENNA);
                ch.setBorderWidth(0f);
                ch.setHorizontalAlignment(enc.equals("DESCRIPCIÓN") ?
                    Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
                tabla.addCell(ch);
            }

            // Filas alternas beige / blanco
            for (int i = 0; i < items.size(); i++) {
                CompraRequest.ItemCompra item = items.get(i);
                String nombre = i < nombresProductos.size() ? nombresProductos.get(i) : "Producto";
                double subtotal = item.getPrecio() * item.getCantidad();
                java.awt.Color bgFila = (i % 2 == 0) ? java.awt.Color.WHITE : BEIGE_CLARO;

                tabla.addCell(celda(nombre,        fCelda, bgFila, GRIS_LINEA, Element.ALIGN_LEFT));
                tabla.addCell(celda(String.valueOf(item.getCantidad()), fCelda, bgFila, GRIS_LINEA, Element.ALIGN_RIGHT));
                tabla.addCell(celda("$" + fmt(item.getPrecio()), fCelda, bgFila, GRIS_LINEA, Element.ALIGN_RIGHT));
                tabla.addCell(celda("$" + fmt(subtotal),         fCelda, bgFila, GRIS_LINEA, Element.ALIGN_RIGHT));
            }
            doc.add(tabla);

            // ══════════════════════════════════════
            // TOTALES
            // ══════════════════════════════════════
            PdfPTable totales = new PdfPTable(2);
            totales.setWidthPercentage(46);
            totales.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totales.setWidths(new float[]{55, 45});
            totales.setSpacingBefore(0f);
            totales.setSpacingAfter(22f);

            double iva = total * 0.16;

            // Fila subtotal
            agregarFilaTotales(totales, "SUBTOTAL", "$" + fmt(total),
                fTotalLabel, fCelda, BEIGE_CLARO, GRIS_LINEA);
            // Fila IVA
            agregarFilaTotales(totales, "IVA (16%)", "$" + fmt(iva),
                fTotalLabel, fCelda, java.awt.Color.WHITE, GRIS_LINEA);
            // Fila TOTAL — fondo sienna, texto blanco
            agregarFilaTotalDestacado(totales, "TOTAL", "$" + fmt(total + iva),
                fTotalFinal, SIENNA, SIENNA);

            doc.add(totales);

            // ── Línea separadora sienna ──
            doc.add(lineaSeparadora(SIENNA));

            // ══════════════════════════════════════
            // PIE DE PÁGINA
            // ══════════════════════════════════════
            PdfPTable pie = new PdfPTable(2);
            pie.setWidthPercentage(100);
            pie.setWidths(new float[]{50, 50});
            pie.setSpacingBefore(12f);

            Font fContactoLabel = new Font(Font.HELVETICA, 8, Font.BOLD,   SIENNA);
Font fContactoRed   = new Font(Font.HELVETICA, 8, Font.BOLD,   new java.awt.Color(120, 85, 65));

PdfPCell cContacto = new PdfPCell();
cContacto.setBorder(Rectangle.NO_BORDER);
cContacto.setVerticalAlignment(Element.ALIGN_MIDDLE);

Paragraph pContactoTitulo = new Paragraph("CONTACTO", fContactoLabel);
pContactoTitulo.setSpacingAfter(6f);
cContacto.addElement(pContactoTitulo);

// ── Fila Instagram con ícono ──
PdfPTable rowInsta = new PdfPTable(2);
try { rowInsta.setWidths(new float[]{1, 8}); } catch(Exception ignored){}
rowInsta.setWidthPercentage(100);

PdfPCell cIconInsta = new PdfPCell();
cIconInsta.setBorder(Rectangle.NO_BORDER);
cIconInsta.setPaddingRight(4f);
try {
    InputStream insta = getClass().getResourceAsStream("/static/instagram_icon.png");
    if (insta != null) {
        Image iconInsta = Image.getInstance(insta.readAllBytes());
        iconInsta.scaleToFit(14, 14);
        cIconInsta.addElement(iconInsta);
    }
} catch (Exception ignored) {}
rowInsta.addCell(cIconInsta);

PdfPCell cTextInsta = new PdfPCell();
cTextInsta.setBorder(Rectangle.NO_BORDER);
cTextInsta.setVerticalAlignment(Element.ALIGN_MIDDLE);
Paragraph pInsta = new Paragraph();
pInsta.add(new Chunk("@elite_beautytrc", fContactoRed));
cTextInsta.addElement(pInsta);
rowInsta.addCell(cTextInsta);
cContacto.addElement(rowInsta);
cContacto.addElement(new Paragraph(" ", new Font(Font.HELVETICA, 3)));

// ── Fila Facebook con ícono ──
PdfPTable rowFace = new PdfPTable(2);
try { rowFace.setWidths(new float[]{1, 8}); } catch(Exception ignored){}
rowFace.setWidthPercentage(100);

PdfPCell cIconFace = new PdfPCell();
cIconFace.setBorder(Rectangle.NO_BORDER);
cIconFace.setPaddingRight(4f);
try {
    InputStream face = getClass().getResourceAsStream("/static/facebook_icon.png");
    if (face != null) {
        Image iconFace = Image.getInstance(face.readAllBytes());
        iconFace.scaleToFit(14, 14);
        cIconFace.addElement(iconFace);
    }
} catch (Exception ignored) {}
rowFace.addCell(cIconFace);

PdfPCell cTextFace = new PdfPCell();
cTextFace.setBorder(Rectangle.NO_BORDER);
cTextFace.setVerticalAlignment(Element.ALIGN_MIDDLE);
Paragraph pFace = new Paragraph();
pFace.add(new Chunk("Próximamente", new Font(Font.HELVETICA, 8, Font.ITALIC, new java.awt.Color(180,150,130))));
cTextFace.addElement(pFace);
rowFace.addCell(cTextFace);
cContacto.addElement(rowFace);

pie.addCell(cContacto);


            PdfPCell cGracias = new PdfPCell();
cGracias.setBorder(Rectangle.NO_BORDER);
cGracias.setVerticalAlignment(Element.ALIGN_MIDDLE);

// Texto principal destacado
Font fGraciasGrande = new Font(Font.HELVETICA, 11, Font.BOLD, SIENNA);
Font fGraciasNormal = new Font(Font.HELVETICA,  8, Font.NORMAL, new java.awt.Color(120, 85, 65));
Font fGraciasMini   = new Font(Font.HELVETICA,  7, Font.ITALIC, new java.awt.Color(160, 120, 95));

Paragraph pGracias = new Paragraph("✦  ¡Gracias por tu compra!  ✦", fGraciasGrande);
pGracias.setAlignment(Element.ALIGN_RIGHT);
pGracias.setSpacingAfter(4f);
cGracias.addElement(pGracias);

Paragraph pPolitica = new Paragraph("Cambios y devoluciones dentro de 30 días con ticket.", fGraciasNormal);
pPolitica.setAlignment(Element.ALIGN_RIGHT);
pPolitica.setSpacingAfter(3f);
cGracias.addElement(pPolitica);

Paragraph pSlogan = new Paragraph("— Tu belleza, nuestra prioridad —", fGraciasMini);
pSlogan.setAlignment(Element.ALIGN_RIGHT);
cGracias.addElement(pSlogan);

pie.addCell(cGracias);


            doc.add(pie);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando ticket PDF: " + e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────

    private String fmt(double v) {
        return String.format("%.2f", v);
    }

    private PdfPCell celda(String texto, Font font, java.awt.Color bg,
                            java.awt.Color border, int align) {
        PdfPCell c = new PdfPCell(new Phrase(texto, font));
        c.setBackgroundColor(bg);
        c.setPadding(6f);
        c.setBorderColor(border);
        c.setHorizontalAlignment(align);
        return c;
    }

    private PdfPTable lineaSeparadora(java.awt.Color color) throws Exception {
        PdfPTable linea = new PdfPTable(1);
        linea.setWidthPercentage(100);
        linea.setSpacingAfter(14f);
        linea.setSpacingBefore(2f);
        PdfPCell lc = new PdfPCell(new Phrase(" "));
        lc.setFixedHeight(2.5f);
        lc.setBackgroundColor(color);
        lc.setBorder(Rectangle.NO_BORDER);
        linea.addCell(lc);
        return linea;
    }

    private void agregarFilaTotales(PdfPTable tabla, String label, String valor,
                                     Font fLabel, Font fValor,
                                     java.awt.Color bg, java.awt.Color border) {
        PdfPCell cL = new PdfPCell(new Phrase(label, fLabel));
        cL.setBackgroundColor(bg); cL.setPadding(6f);
        cL.setBorderColor(border); cL.setHorizontalAlignment(Element.ALIGN_LEFT);
        tabla.addCell(cL);
        PdfPCell cV = new PdfPCell(new Phrase(valor, fValor));
        cV.setBackgroundColor(bg); cV.setPadding(6f);
        cV.setBorderColor(border); cV.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tabla.addCell(cV);
    }

    private void agregarFilaTotalDestacado(PdfPTable tabla, String label, String valor,
                                            Font font,
                                            java.awt.Color bg, java.awt.Color border) {
        PdfPCell cL = new PdfPCell(new Phrase(label, font));
        cL.setBackgroundColor(bg); cL.setPadding(8f);
        cL.setBorderColor(border); cL.setHorizontalAlignment(Element.ALIGN_LEFT);
        tabla.addCell(cL);
        PdfPCell cV = new PdfPCell(new Phrase(valor, font));
        cV.setBackgroundColor(bg); cV.setPadding(8f);
        cV.setBorderColor(border); cV.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tabla.addCell(cV);
    }
}






































