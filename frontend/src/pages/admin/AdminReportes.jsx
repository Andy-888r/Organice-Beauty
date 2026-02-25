import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, AppBar, Toolbar, Grid, Card, CardContent } from '@mui/material';
import Sidebar from '../../components/shared/Sidebar';
import { inventarioAPI, adminAPI, productosAPI } from '../../services/api';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';

const MENU = [
  { label: 'Dashboard', icon: <Assessment />, path: '/admin' },
  { label: 'Productos', icon: <Inventory />, path: '/admin/productos' },
  { label: 'Clientes', icon: <People />, path: '/admin/clientes' },
  { label: 'Proveedores', icon: <Store />, path: '/admin/proveedores' },
  { label: 'Inventario', icon: <Inventory />, path: '/admin/inventario' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/admin/solicitudes' },
  { label: 'Reportes', icon: <Assessment />, path: '/admin/reportes' },
];

export default function AdminReportes() {
  const [bajoStock, setBajoStock] = useState([]);

  useEffect(() => {
    inventarioAPI.listar().then(r => {
      setBajoStock(r.data.filter(i => i.estado !== 'OK'));
    });
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Reportes</Typography></Toolbar>
        </AppBar>

        <Typography variant="h6" mb={2}>Productos con Stock Bajo o Sin Stock</Typography>
        <Grid container spacing={2}>
          {bajoStock.map((i, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ borderLeft: `4px solid ${i.estado === 'SIN STOCK' ? '#f44336' : '#ff9800'}` }}>
                <CardContent>
                  <Typography fontWeight="bold">{i.producto?.nombre}</Typography>
                  <Typography variant="body2">Stock: {i.stock} / Mínimo: {i.minimo}</Typography>
                  <Typography variant="body2" color={i.estado === 'SIN STOCK' ? 'error' : 'warning.main'}>
                    Estado: {i.estado}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {bajoStock.length === 0 && <Grid item xs={12}><Typography color="success.main">✅ Todos los productos tienen stock suficiente</Typography></Grid>}
        </Grid>
      </Box>
    </Box>
  );
}
