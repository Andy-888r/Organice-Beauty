import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, AppBar, Toolbar } from '@mui/material';
import { Inventory, People, Store, Notifications, Assessment } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { solicitudesAPI, adminAPI, productosAPI } from '../../services/api';

const MENU = [
  { label: 'Dashboard', icon: <Assessment />, path: '/admin' },
  { label: 'Productos', icon: <Inventory />, path: '/admin/productos' },
  { label: 'Banners', icon: <Assessment />, path: '/admin/banners' },
  { label: 'Clientes', icon: <People />, path: '/admin/clientes' },
  { label: 'Proveedores', icon: <Store />, path: '/admin/proveedores' },
  { label: 'Inventario', icon: <Inventory />, path: '/admin/inventario' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/admin/solicitudes' },
  { label: 'Reportes', icon: <Assessment />, path: '/admin/reportes' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ solicitudes: 0, clientes: 0, proveedores: 0, productos: 0 });

  useEffect(() => {
    Promise.all([
      solicitudesAPI.contarPendientes(),
      adminAPI.clientes(),
      adminAPI.proveedores(),
      productosAPI.listarTodos(),
    ]).then(([sol, cli, prov, prod]) => {
      setStats({ solicitudes: sol.data.total, clientes: cli.data.length, proveedores: prov.data.length, productos: prod.data.length });
    });
  }, []);

  const cards = [
    { label: 'Solicitudes Pendientes', value: stats.solicitudes, color: '#e91e63', icon: '📋' },
    { label: 'Clientes Registrados', value: stats.clientes, color: '#2196f3', icon: '👥' },
    { label: 'Proveedores Activos', value: stats.proveedores, color: '#4caf50', icon: '🏪' },
    { label: 'Productos en Sistema', value: stats.productos, color: '#ff9800', icon: '📦' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Panel de Administración</Typography></Toolbar>
        </AppBar>
        <Grid container spacing={3}>
          {cards.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.label}>
              <Card sx={{ borderLeft: `4px solid ${c.color}`, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h3">{c.icon}</Typography>
                  <Typography variant="h4" fontWeight="bold" color={c.color}>{c.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
