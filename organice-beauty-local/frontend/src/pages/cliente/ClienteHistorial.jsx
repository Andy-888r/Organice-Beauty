import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
         Paper, AppBar, Toolbar } from '@mui/material';
import { ShoppingCart, History, Person } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { clienteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar', icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />, path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />, path: '/cliente/perfil' },
];

export default function ClienteHistorial() {
  const [historial, setHistorial] = useState([]);
  const { user } = useAuth();

  useEffect(() => { clienteAPI.historial(user.id).then(r => setHistorial(r.data)); }, [user.id]);

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb:2 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Mi Historial de Compras</Typography></Toolbar>
        </AppBar>
        <Paper>
          <Table>
            <TableHead sx={{ bgcolor:'#fce4ec' }}>
              <TableRow>
                {['Fecha','Producto','Cantidad','Total'].map(h => (
                  <TableCell key={h} sx={{ fontWeight:'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {historial.map((h, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{new Date(h.fecha).toLocaleString()}</TableCell>
                  <TableCell>{h.producto?.nombre}</TableCell>
                  <TableCell>{h.cantidad}</TableCell>
                  <TableCell>${h.total?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {historial.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">No tienes compras registradas</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}
