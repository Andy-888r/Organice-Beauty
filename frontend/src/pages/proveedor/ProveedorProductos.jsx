import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, AppBar, Toolbar } from '@mui/material';
import { Assignment, Inventory, Person, Notifications } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { proveedorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <Assignment />, path: '/proveedor' },
  { label: 'Mis Productos', icon: <Inventory />, path: '/proveedor/productos' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/proveedor/solicitudes' },
  { label: 'Mi Perfil', icon: <Person />, path: '/proveedor/perfil' },
];

export default function ProveedorProductos() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);

  useEffect(() => { proveedorAPI.productos(user.id).then(r => setProductos(r.data)); }, [user.id]);

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb:3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Mis Productos</Typography></Toolbar>
        </AppBar>
        <Grid container spacing={2}>
          {productos.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card>
                {p.imagenPath
                  ? <CardMedia component="img" height="140" image={`http://localhost:8080${p.imagenPath}`} alt={p.nombre} />
                  : <Box sx={{ height:140, bgcolor:'#f8bbd9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Typography fontSize={36}>💄</Typography></Box>
                }
                <CardContent>
                  <Typography variant="h6">{p.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.marca} | {p.categoria}</Typography>
                  <Typography color="primary" fontWeight="bold">${p.precio?.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
