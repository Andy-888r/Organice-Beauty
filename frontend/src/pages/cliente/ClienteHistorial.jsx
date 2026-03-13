import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, AppBar, Toolbar } from '@mui/material';
import { ShoppingCart, History, Person } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { clienteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio',    icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar',   icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />,      path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />,       path: '/cliente/perfil' },
];

export default function ClienteHistorial() {
  const [historial, setHistorial] = useState([]);
  const { user } = useAuth();
  useEffect(() => { clienteAPI.historial(user.id).then(r => setHistorial(r.data)); }, [user.id]);

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ mb:2, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar><Typography variant="h5" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Mi Historial de Compras</Typography></Toolbar>
        </AppBar>
        <Paper sx={{ borderRadius:2, overflow:'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor:'#F5E6D8' }}>
              <TableRow>
                {['Fecha','Producto','Cantidad','Total'].map(h => (
                  <TableCell key={h} sx={{ fontWeight:'bold', color:'#3d2b26' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {historial.map((h, idx) => (
                <TableRow key={idx} hover sx={{ '&:hover':{ bgcolor:'rgba(245,230,216,0.30)' } }}>
                  <TableCell>{new Date(h.fecha).toLocaleString()}</TableCell>
                  <TableCell>{h.producto?.nombre}</TableCell>
                  <TableCell>{h.cantidad}</TableCell>
                  <TableCell sx={{ color:'#A0522D', fontWeight:'bold' }}>${h.total?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {historial.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ color:'text.secondary', py:4 }}>No tienes compras registradas</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}




































