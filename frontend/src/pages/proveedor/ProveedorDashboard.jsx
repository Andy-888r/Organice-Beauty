import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { Assignment, Inventory, Person, Notifications } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { solicitudesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <Assignment />, path: '/proveedor' },
  { label: 'Mis Productos', icon: <Inventory />, path: '/proveedor/productos' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/proveedor/solicitudes' },
  { label: 'Mi Perfil', icon: <Person />, path: '/proveedor/perfil' },
];

export default function ProveedorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    solicitudesAPI.listarPorProveedor(user.id).then(r => {
      setPendientes(r.data.filter(s => s.estado === 'Pendiente').length);
    });
  }, [user.id]);

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb:3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Panel Proveedor — {user?.nombre}</Typography></Toolbar>
        </AppBar>
        <Grid container spacing={3}>
          {[
            { label:'Mis Productos', icon:'📦', path:'/proveedor/productos', color:'#4caf50' },
            { label:`Solicitudes Enviadas (${pendientes} pendientes)`, icon:'📋', path:'/proveedor/solicitudes', color:'#e91e63' },
            { label:'Mi Perfil', icon:'👤', path:'/proveedor/perfil', color:'#3f51b5' },
          ].map(c => (
            <Grid item xs={12} sm={4} key={c.label}>
              <Card sx={{ cursor:'pointer', borderLeft:`4px solid ${c.color}`, '&:hover':{ boxShadow:4 } }}
                    onClick={() => navigate(c.path)}>
                <CardContent sx={{ textAlign:'center', py:4 }}>
                  <Typography variant="h2">{c.icon}</Typography>
                  <Typography variant="h6" mt={1}>{c.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
