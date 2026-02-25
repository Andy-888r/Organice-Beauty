import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { ShoppingCart, History, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar', icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />, path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />, path: '/cliente/perfil' },
];

export default function ClienteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb:3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">¡Hola, {user?.nombre}! 💄</Typography></Toolbar>
        </AppBar>
        <Grid container spacing={3}>
          {[
            { label:'Ver Productos y Comprar', icon:'🛍️', path:'/cliente/compras', color:'#e91e63' },
            { label:'Mi Historial de Compras', icon:'📋', path:'/cliente/historial', color:'#9c27b0' },
            { label:'Mi Perfil', icon:'👤', path:'/cliente/perfil', color:'#3f51b5' },
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
