import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, AppBar, Toolbar } from '@mui/material';
import { Inventory, People, Store, Notifications, Assessment } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { solicitudesAPI, adminAPI, productosAPI } from '../../services/api';

const MENU = [
  { label: 'Dashboard',   icon: <Assessment />,    path: '/admin' },
  { label: 'Productos',   icon: <Inventory />,     path: '/admin/productos' },
  { label: 'Banners',     icon: <Assessment />,    path: '/admin/banners' },
  { label: 'Clientes',    icon: <People />,        path: '/admin/clientes' },
  { label: 'Proveedores', icon: <Store />,         path: '/admin/proveedores' },
  { label: 'Inventario',  icon: <Inventory />,     path: '/admin/inventario' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/admin/solicitudes' },
  { label: 'Reportes',    icon: <Assessment />,    path: '/admin/reportes' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ solicitudes:0, clientes:0, proveedores:0, productos:0 });

  useEffect(() => {
    Promise.all([solicitudesAPI.contarPendientes(), adminAPI.clientes(), adminAPI.proveedores(), productosAPI.listarTodos()])
      .then(([sol, cli, prov, prod]) => {
        setStats({ solicitudes: sol.data.total, clientes: cli.data.length, proveedores: prov.data.length, productos: prod.data.length });
      });
  }, []);

  const cards = [
    { label:'Solicitudes Pendientes', value:stats.solicitudes, color:'#A0522D', bg:'#F5E6D8', icon:'📋' },
    { label:'Clientes Registrados',   value:stats.clientes,    color:'#6b8fa3', bg:'#dce8f0', icon:'👥' },
    { label:'Proveedores Activos',     value:stats.proveedores, color:'#6a9b7a', bg:'#dceee3', icon:'🏪' },
    { label:'Productos en Sistema',    value:stats.productos,   color:'#b09060', bg:'#f0e8d8', icon:'📦' },
  ];

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ mb:3, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar><Typography variant="h5" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif', letterSpacing:'0.05em' }}>Panel de Administración</Typography></Toolbar>
        </AppBar>
        <Grid container spacing={3}>
          {cards.map(c => (
            <Grid item xs={12} sm={6} md={3} key={c.label}>
              <Card sx={{ borderLeft:`4px solid ${c.color}`, borderRadius:2, bgcolor:'#FFFFFF',
                boxShadow:'0 2px 12px rgba(160,82,45,0.10)', '&:hover':{ boxShadow:'0 4px 20px rgba(160,82,45,0.18)' }, transition:'box-shadow 0.2s' }}>
                <CardContent>
                  <Typography variant="h3">{c.icon}</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color:c.color }}>{c.value}</Typography>
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




































