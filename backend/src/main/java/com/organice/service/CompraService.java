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
            hc.setCliente(cliente); hc.setProducto(prod);
            hc.setCantidad(item.getCantidad()); hc.setTotal(subtotal);
            hc.setFecha(LocalDateTime.now());
            historialCompraRepo.save(hc);
            inventarioRepo.findByProductoId(prod.getId()).ifPresent(inv -> {
                int nuevoStock = Math.max(0, inv.getStock() - item.getCantidad());
                inv.setStock(nuevoStock);
                inv.setEstado(nuevoStock == 0 ? "SIN STOCK" : nuevoStock <= inv.getMinimo() ? "BAJO" : "OK");
                inventarioRepo.save(inv);
                HistorialMovimiento mov = new HistorialMovimiento();
                mov.setProducto(prod); mov.setTipo("Salida");
                mov.setCantidad(item.getCantidad()); mov.setMotivo("Venta a cliente");
                mov.setFecha(LocalDateTime.now());
                movimientoRepo.save(mov);
            });
        }
        return total;
    }

    public byte[] generarTicketPDF(String nombreCliente,
                                    List<CompraRequest.ItemCompra> items,
                                    List<String> nombresProductos,
                                    double total) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Rectangle pageSize = new Rectangle(340, 700);
            Document doc = new Document(pageSize, 28, 28, 28, 28);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // ══════════════════════════════════════
            // PALETA ELITE BEAUTY — VERDE
            // ══════════════════════════════════════
            java.awt.Color VERDE_OSCURO  = new java.awt.Color(44,  74,  30);   // #2C4A1E
            java.awt.Color VERDE_MEDIO   = new java.awt.Color(85,  136, 59);   // #55883B
            java.awt.Color VERDE_CLARO   = new java.awt.Color(193, 232,153);   // #C1E899
            java.awt.Color VERDE_FONDO   = new java.awt.Color(237, 245,228);   // #EDF5E4
            java.awt.Color VERDE_MENTA   = new java.awt.Color(230, 240,220);   // #E6F0DC
            java.awt.Color CAFE          = new java.awt.Color(154, 103, 53);   // #9A6735
            java.awt.Color DORADO        = new java.awt.Color(201, 168, 76);   // #C9A84C
            java.awt.Color BLANCO        = java.awt.Color.WHITE;
            java.awt.Color TEXTO         = new java.awt.Color(44,  74,  30);   // texto principal
            java.awt.Color TEXTO_CLARO   = new java.awt.Color(85,  136, 59);   // texto secundario
            java.awt.Color BORDE         = new java.awt.Color(193, 218,170);   // borde suave

            // ══════════════════════════════════════
            // FUENTES
            // ══════════════════════════════════════
            Font fBrand      = new Font(Font.HELVETICA, 15, Font.BOLD,   BLANCO);
            Font fBrandSub   = new Font(Font.HELVETICA,  6, Font.NORMAL, VERDE_CLARO);
            Font fDocTitle   = new Font(Font.HELVETICA,  8, Font.BOLD,   VERDE_MEDIO);
            Font fFolio      = new Font(Font.HELVETICA, 11, Font.BOLD,   TEXTO);
            Font fLabelSmall = new Font(Font.HELVETICA,  6, Font.BOLD,   VERDE_MEDIO);
            Font fValor      = new Font(Font.HELVETICA,  9, Font.BOLD,   TEXTO);
            Font fValorSub   = new Font(Font.HELVETICA,  7, Font.NORMAL, TEXTO_CLARO);
            Font fThHead     = new Font(Font.HELVETICA,  7, Font.BOLD,   BLANCO);
            Font fTdNombre   = new Font(Font.HELVETICA,  8, Font.NORMAL, TEXTO);
            Font fTdNum      = new Font(Font.HELVETICA,  8, Font.BOLD,   TEXTO);
            Font fTdSub      = new Font(Font.HELVETICA,  8, Font.BOLD,   VERDE_MEDIO);
            Font fTotalLabel = new Font(Font.HELVETICA,  8, Font.BOLD,   TEXTO_CLARO);
            Font fTotalVal   = new Font(Font.HELVETICA,  8, Font.NORMAL, TEXTO);
            Font fGrandTotal = new Font(Font.HELVETICA, 12, Font.BOLD,   BLANCO);
            Font fFooter     = new Font(Font.HELVETICA,  7, Font.NORMAL, VERDE_MEDIO);
            Font fFooterBold = new Font(Font.HELVETICA,  8, Font.BOLD,   VERDE_OSCURO);
            Font fSlogan     = new Font(Font.HELVETICA,  6, Font.ITALIC, CAFE);

            java.util.Locale localeMX = new java.util.Locale.Builder()
                .setLanguage("es").setRegion("MX").build();
            String fecha = LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", localeMX));
            String hora  = LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
            String folio = "EB-" + (System.currentTimeMillis() % 100000);

            PdfContentByte canvas = writer.getDirectContent();
            float W = pageSize.getWidth();
            float H = pageSize.getHeight();

            // ── Fondo verde menta ──
            canvas.setColorFill(VERDE_FONDO);
            canvas.rectangle(0, 0, W, H);
            canvas.fill();

            // ── Borde exterior dorado ──
            canvas.setColorStroke(DORADO);
            canvas.setLineWidth(1.2f);
            canvas.rectangle(8, 8, W - 16, H - 16);
            canvas.stroke();
            // Borde interior verde claro
            canvas.setColorStroke(VERDE_CLARO);
            canvas.setLineWidth(0.4f);
            canvas.rectangle(12, 12, W - 24, H - 24);
            canvas.stroke();

            // ── Header verde oscuro ──
            float headerH = 92f;
            canvas.setColorFill(VERDE_OSCURO);
            canvas.rectangle(0, H - headerH, W, headerH);
            canvas.fill();
            // Franja inferior del header dorada
            canvas.setColorFill(DORADO);
            canvas.rectangle(0, H - headerH - 3f, W, 3f);
            canvas.fill();

            // ── Logo + nombre centrado en header ──
            PdfPTable tHeader = new PdfPTable(1);
            tHeader.setWidthPercentage(100);
            tHeader.setSpacingAfter(0f);
            PdfPCell cHeader = new PdfPCell();
            cHeader.setBackgroundColor(VERDE_OSCURO);
            cHeader.setBorder(Rectangle.NO_BORDER);
            cHeader.setPaddingTop(12f); cHeader.setPaddingBottom(12f);
            cHeader.setPaddingLeft(16f); cHeader.setPaddingRight(16f);

            try {
                InputStream imgStream = getClass().getResourceAsStream("/static/logo_elite_beauty.png");
                if (imgStream == null) imgStream = getClass().getResourceAsStream("/logo_elite_beauty.png");
                if (imgStream != null) {
                    Image logo = Image.getInstance(imgStream.readAllBytes());
                    logo.scaleToFit(44, 44);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    PdfPTable tLogo = new PdfPTable(1);
                    PdfPCell cLogo = new PdfPCell(logo);
                    cLogo.setBorder(Rectangle.NO_BORDER);
                    cLogo.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cLogo.setPaddingBottom(6f);
                    tLogo.addCell(cLogo);
                    PdfPCell cBrand = new PdfPCell();
                    cBrand.setBorder(Rectangle.NO_BORDER);
                    Paragraph pB = new Paragraph("ELITE BEAUTY", fBrand);
                    pB.setAlignment(Element.ALIGN_CENTER);
                    cBrand.addElement(pB);
                    Paragraph pBS = new Paragraph("TIENDA DE BELLEZA", fBrandSub);
                    pBS.setAlignment(Element.ALIGN_CENTER);
                    cBrand.addElement(pBS);
                    tLogo.addCell(cBrand);
                    cHeader.addElement(tLogo);
                }
            } catch (Exception ignored) {
                Paragraph pB = new Paragraph("ELITE BEAUTY", fBrand);
                pB.setAlignment(Element.ALIGN_CENTER);
                cHeader.addElement(pB);
                Paragraph pBS = new Paragraph("TIENDA DE BELLEZA", fBrandSub);
                pBS.setAlignment(Element.ALIGN_CENTER);
                cHeader.addElement(pBS);
            }
            tHeader.addCell(cHeader);
            doc.add(tHeader);

            doc.add(new Paragraph(" ", new Font(Font.HELVETICA, 5)));

            // ── Titulo + folio ──
            PdfPTable tTitulo = new PdfPTable(1);
            tTitulo.setWidthPercentage(100);
            tTitulo.setSpacingAfter(12f);
            PdfPCell cTitulo = new PdfPCell();
            cTitulo.setBorder(Rectangle.NO_BORDER);
            cTitulo.setPaddingTop(6f); cTitulo.setPaddingBottom(4f);
            Paragraph pDocTitle = new Paragraph("TICKET DE COMPRA", fDocTitle);
            pDocTitle.setAlignment(Element.ALIGN_CENTER);
            pDocTitle.setSpacingAfter(4f);
            cTitulo.addElement(pDocTitle);
            Paragraph pFolio = new Paragraph("#" + folio, fFolio);
            pFolio.setAlignment(Element.ALIGN_CENTER);
            cTitulo.addElement(pFolio);
            tTitulo.addCell(cTitulo);
            doc.add(tTitulo);

            // ── Linea decorativa verde-dorada ──
            doc.add(lineaDecorativa(VERDE_MEDIO, DORADO, VERDE_FONDO));

            // ── Bloque cliente + fecha ──
            PdfPTable tInfo = new PdfPTable(2);
            tInfo.setWidthPercentage(100);
            tInfo.setWidths(new float[]{50, 50});
            tInfo.setSpacingBefore(8f);
            tInfo.setSpacingAfter(12f);

            tInfo.addCell(infoCelda("CLIENTE",
                nombreCliente != null ? nombreCliente : "Cliente",
                "Compra registrada",
                fLabelSmall, fValor, fValorSub,
                VERDE_MENTA, BORDE, VERDE_MEDIO, true));

            tInfo.addCell(infoCelda("FECHA",
                fecha, "Hora: " + hora,
                fLabelSmall, fValor, fValorSub,
                VERDE_MENTA, BORDE, VERDE_MEDIO, false));

            doc.add(tInfo);

            // ── Tabla productos ──
            PdfPTable tProductos = new PdfPTable(4);
            tProductos.setWidthPercentage(100);
            tProductos.setWidths(new float[]{42, 12, 22, 24});
            tProductos.setSpacingAfter(0f);

            String[] heads  = { "PRODUCTO", "UDS", "PRECIO", "TOTAL" };
            int[]    aligns = { Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT };
            for (int i = 0; i < heads.length; i++) {
                PdfPCell ch = new PdfPCell(new Phrase(heads[i], fThHead));
                ch.setBackgroundColor(VERDE_OSCURO);
                ch.setPaddingTop(8f); ch.setPaddingBottom(8f);
                ch.setPaddingLeft(i == 0 ? 8f : 4f);
                ch.setPaddingRight(i == heads.length - 1 ? 8f : 4f);
                ch.setBorder(Rectangle.NO_BORDER);
                ch.setHorizontalAlignment(aligns[i]);
                tProductos.addCell(ch);
            }

            for (int i = 0; i < items.size(); i++) {
                CompraRequest.ItemCompra item = items.get(i);
                String nombre   = i < nombresProductos.size() ? nombresProductos.get(i) : "Producto";
                double subtotal = item.getPrecio() * item.getCantidad();
                java.awt.Color bgFila = (i % 2 == 0) ? BLANCO : VERDE_MENTA;

                PdfPCell cNom = new PdfPCell(new Phrase(nombre, fTdNombre));
                cNom.setBackgroundColor(bgFila); cNom.setPaddingTop(7f); cNom.setPaddingBottom(7f);
                cNom.setPaddingLeft(8f); cNom.setBorderColor(BORDE);
                cNom.setBorderWidthTop(0f); cNom.setBorderWidthBottom(0.5f);
                cNom.setBorderWidthLeft(0f); cNom.setBorderWidthRight(0f);
                tProductos.addCell(cNom);

                PdfPCell cCant = new PdfPCell(new Phrase(String.valueOf(item.getCantidad()), fTdNum));
                cCant.setBackgroundColor(bgFila); cCant.setPaddingTop(7f); cCant.setPaddingBottom(7f);
                cCant.setBorderColor(BORDE); cCant.setBorderWidthTop(0f); cCant.setBorderWidthBottom(0.5f);
                cCant.setBorderWidthLeft(0f); cCant.setBorderWidthRight(0f);
                cCant.setHorizontalAlignment(Element.ALIGN_CENTER);
                tProductos.addCell(cCant);

                PdfPCell cPrecio = new PdfPCell(new Phrase("$" + fmt(item.getPrecio()), fTdNum));
                cPrecio.setBackgroundColor(bgFila); cPrecio.setPaddingTop(7f); cPrecio.setPaddingBottom(7f);
                cPrecio.setPaddingRight(4f); cPrecio.setBorderColor(BORDE);
                cPrecio.setBorderWidthTop(0f); cPrecio.setBorderWidthBottom(0.5f);
                cPrecio.setBorderWidthLeft(0f); cPrecio.setBorderWidthRight(0f);
                cPrecio.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tProductos.addCell(cPrecio);

                PdfPCell cSub = new PdfPCell(new Phrase("$" + fmt(subtotal), fTdSub));
                cSub.setBackgroundColor(bgFila); cSub.setPaddingTop(7f); cSub.setPaddingBottom(7f);
                cSub.setPaddingRight(8f); cSub.setBorderColor(BORDE);
                cSub.setBorderWidthTop(0f); cSub.setBorderWidthBottom(0.5f);
                cSub.setBorderWidthLeft(0f); cSub.setBorderWidthRight(0f);
                cSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                tProductos.addCell(cSub);
            }
            doc.add(tProductos);

            doc.add(lineaFina(VERDE_MEDIO));

            // ── Totales ──
            double iva      = total * 0.16;
            double totalFin = total + iva;

            PdfPTable tTotales = new PdfPTable(2);
            tTotales.setWidthPercentage(80);
            tTotales.setHorizontalAlignment(Element.ALIGN_RIGHT);
            tTotales.setWidths(new float[]{55, 45});
            tTotales.setSpacingBefore(6f);
            tTotales.setSpacingAfter(16f);

            filaTotales(tTotales, "Subtotal", "$" + fmt(total), fTotalLabel, fTotalVal, BLANCO, BORDE);
            filaTotales(tTotales, "IVA (16%)", "$" + fmt(iva), fTotalLabel, fTotalVal, VERDE_MENTA, BORDE);

            PdfPCell cTL = new PdfPCell(new Phrase("TOTAL", fGrandTotal));
            cTL.setBackgroundColor(VERDE_OSCURO); cTL.setPaddingTop(9f); cTL.setPaddingBottom(9f);
            cTL.setPaddingLeft(10f); cTL.setBorder(Rectangle.NO_BORDER);
            cTL.setHorizontalAlignment(Element.ALIGN_LEFT);
            tTotales.addCell(cTL);
            PdfPCell cTV = new PdfPCell(new Phrase("$" + fmt(totalFin), fGrandTotal));
            cTV.setBackgroundColor(VERDE_OSCURO); cTV.setPaddingTop(9f); cTV.setPaddingBottom(9f);
            cTV.setPaddingRight(10f); cTV.setBorder(Rectangle.NO_BORDER);
            cTV.setHorizontalAlignment(Element.ALIGN_RIGHT);
            tTotales.addCell(cTV);
            doc.add(tTotales);

            doc.add(lineaDecorativa(VERDE_MEDIO, DORADO, VERDE_FONDO));

            // ── Pie ──
            doc.add(new Paragraph(" ", new Font(Font.HELVETICA, 4)));

            Paragraph pGracias = new Paragraph("Gracias por tu compra", fFooterBold);
            pGracias.setAlignment(Element.ALIGN_CENTER); pGracias.setSpacingAfter(3f);
            doc.add(pGracias);

            Paragraph pSlogan = new Paragraph("— Tu belleza, nuestra prioridad —", fSlogan);
            pSlogan.setAlignment(Element.ALIGN_CENTER); pSlogan.setSpacingAfter(6f);
            doc.add(pSlogan);

            Paragraph pPolitica = new Paragraph(
                "Cambios y devoluciones dentro de 30 dias con este ticket.",
                new Font(Font.HELVETICA, 6, Font.NORMAL, TEXTO_CLARO));
            pPolitica.setAlignment(Element.ALIGN_CENTER); pPolitica.setSpacingAfter(6f);
            doc.add(pPolitica);

            // ── Redes sociales ──
            PdfPTable tRedes = new PdfPTable(2);
            tRedes.setWidthPercentage(70);
            tRedes.setHorizontalAlignment(Element.ALIGN_CENTER);
            tRedes.setWidths(new float[]{50, 50});
            tRedes.setSpacingBefore(4f);
            tRedes.setSpacingAfter(8f);

            PdfPCell cInsta = new PdfPCell();
            cInsta.setBorder(Rectangle.NO_BORDER); cInsta.setHorizontalAlignment(Element.ALIGN_CENTER);
            PdfPTable rowInsta = new PdfPTable(2);
            try { rowInsta.setWidths(new float[]{1, 4}); } catch (Exception ignored) {}
            PdfPCell cIconInsta = new PdfPCell(); cIconInsta.setBorder(Rectangle.NO_BORDER); cIconInsta.setPaddingRight(4f);
            try {
                InputStream insta = getClass().getResourceAsStream("/static/instagram_icon.png");
                if (insta != null) { Image i = Image.getInstance(insta.readAllBytes()); i.scaleToFit(12,12); cIconInsta.addElement(i); }
            } catch (Exception ignored) {}
            rowInsta.addCell(cIconInsta);
            PdfPCell cTextInsta = new PdfPCell(); cTextInsta.setBorder(Rectangle.NO_BORDER); cTextInsta.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cTextInsta.addElement(new Paragraph("@elite_beautytrc", new Font(Font.HELVETICA, 7, Font.BOLD, VERDE_MEDIO)));
            rowInsta.addCell(cTextInsta);
            cInsta.addElement(rowInsta);
            tRedes.addCell(cInsta);

            PdfPCell cFace = new PdfPCell();
            cFace.setBorder(Rectangle.NO_BORDER); cFace.setHorizontalAlignment(Element.ALIGN_CENTER);
            PdfPTable rowFace = new PdfPTable(2);
            try { rowFace.setWidths(new float[]{1, 4}); } catch (Exception ignored) {}
            PdfPCell cIconFace = new PdfPCell(); cIconFace.setBorder(Rectangle.NO_BORDER); cIconFace.setPaddingRight(4f);
            try {
                InputStream face = getClass().getResourceAsStream("/static/facebook_icon.png");
                if (face != null) { Image i = Image.getInstance(face.readAllBytes()); i.scaleToFit(12,12); cIconFace.addElement(i); }
            } catch (Exception ignored) {}
            rowFace.addCell(cIconFace);
            PdfPCell cTextFace = new PdfPCell(); cTextFace.setBorder(Rectangle.NO_BORDER); cTextFace.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cTextFace.addElement(new Paragraph("Proximamente", new Font(Font.HELVETICA, 7, Font.ITALIC, CAFE)));
            rowFace.addCell(cTextFace);
            cFace.addElement(rowFace);
            tRedes.addCell(cFace);
            doc.add(tRedes);

            // ── Franja inferior verde oscuro ──
            PdfPTable tFooterBar = new PdfPTable(1);
            tFooterBar.setWidthPercentage(100); tFooterBar.setSpacingBefore(10f);
            PdfPCell cFooterBar = new PdfPCell(new Phrase(" "));
            cFooterBar.setBackgroundColor(VERDE_OSCURO); cFooterBar.setFixedHeight(6f);
            cFooterBar.setBorder(Rectangle.NO_BORDER);
            tFooterBar.addCell(cFooterBar);
            doc.add(tFooterBar);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando ticket PDF: " + e.getMessage());
        }
    }

    // ══════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════
    private String fmt(double v) { return String.format("%.2f", v); }

    private PdfPCell infoCelda(String label, String valor, String sub,
                                Font fLabel, Font fValor, Font fSub,
                                java.awt.Color bg, java.awt.Color border,
                                java.awt.Color lineColor,
                                boolean isLeft) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(bg); c.setBorderColor(border); c.setBorderWidth(0.8f);
        c.setPaddingTop(10f); c.setPaddingBottom(10f);
        c.setPaddingLeft(isLeft ? 10f : 8f); c.setPaddingRight(isLeft ? 8f : 10f);
        Paragraph pL = new Paragraph(label, fLabel); pL.setSpacingAfter(4f); c.addElement(pL);
        PdfPTable linea = new PdfPTable(1);
        PdfPCell lc = new PdfPCell(new Phrase(" ")); lc.setFixedHeight(1.5f); lc.setBackgroundColor(lineColor); lc.setBorder(Rectangle.NO_BORDER);
        linea.addCell(lc); c.addElement(linea);
        c.addElement(new Paragraph(" ", new Font(Font.HELVETICA, 3)));
        Paragraph pV = new Paragraph(valor, fValor); pV.setSpacingBefore(4f); pV.setSpacingAfter(2f); c.addElement(pV);
        c.addElement(new Paragraph(sub, fSub));
        return c;
    }

    private PdfPTable lineaDecorativa(java.awt.Color color,
                                       java.awt.Color dorado,
                                       java.awt.Color bg) throws Exception {
        PdfPTable t = new PdfPTable(3);
        t.setWidthPercentage(100); t.setWidths(new float[]{30, 40, 30});
        t.setSpacingBefore(6f); t.setSpacingAfter(6f);
        PdfPCell cL = new PdfPCell(new Phrase(" ")); cL.setFixedHeight(1f); cL.setBackgroundColor(color); cL.setBorder(Rectangle.NO_BORDER); t.addCell(cL);
        PdfPCell cM = new PdfPCell(new Phrase("  \u2756  ", new Font(Font.HELVETICA, 8, Font.NORMAL, dorado)));
        cM.setBorder(Rectangle.NO_BORDER); cM.setHorizontalAlignment(Element.ALIGN_CENTER); cM.setVerticalAlignment(Element.ALIGN_MIDDLE); cM.setBackgroundColor(bg); t.addCell(cM);
        PdfPCell cR = new PdfPCell(new Phrase(" ")); cR.setFixedHeight(1f); cR.setBackgroundColor(color); cR.setBorder(Rectangle.NO_BORDER); t.addCell(cR);
        return t;
    }

    private PdfPTable lineaFina(java.awt.Color color) throws Exception {
        PdfPTable t = new PdfPTable(1); t.setWidthPercentage(100); t.setSpacingBefore(0f); t.setSpacingAfter(4f);
        PdfPCell c = new PdfPCell(new Phrase(" ")); c.setFixedHeight(1.5f); c.setBackgroundColor(color); c.setBorder(Rectangle.NO_BORDER);
        t.addCell(c); return t;
    }

    private void filaTotales(PdfPTable tabla, String label, String valor,
                              Font fLabel, Font fValor,
                              java.awt.Color bg, java.awt.Color border) {
        PdfPCell cL = new PdfPCell(new Phrase(label, fLabel));
        cL.setBackgroundColor(bg); cL.setPaddingTop(5f); cL.setPaddingBottom(5f); cL.setPaddingLeft(10f);
        cL.setBorderColor(border); cL.setBorderWidthBottom(0.5f); cL.setBorderWidthTop(0f); cL.setBorderWidthLeft(0f); cL.setBorderWidthRight(0f);
        cL.setHorizontalAlignment(Element.ALIGN_LEFT); tabla.addCell(cL);
        PdfPCell cV = new PdfPCell(new Phrase(valor, fValor));
        cV.setBackgroundColor(bg); cV.setPaddingTop(5f); cV.setPaddingBottom(5f); cV.setPaddingRight(10f);
        cV.setBorderColor(border); cV.setBorderWidthBottom(0.5f); cV.setBorderWidthTop(0f); cV.setBorderWidthLeft(0f); cV.setBorderWidthRight(0f);
        cV.setHorizontalAlignment(Element.ALIGN_RIGHT); tabla.addCell(cV);
    }
}