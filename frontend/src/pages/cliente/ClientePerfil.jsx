import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, AppBar, Toolbar, Alert } from '@mui/material';
import { ShoppingCart, History, Person } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { clienteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar', icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />, path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />, path: '/cliente/perfil' },
];

export default function ClientePerfil() {
  const [form, setForm] = useState({});
  const { user } = useAuth();

  useEffect(() => { clienteAPI.perfil(user.id).then(r => setForm(r.data)); }, [user.id]);

  const guardar = async () => {
    await clienteAPI.actualizar(user.id, form);
    toast.success('Perfil actualizado');
  };

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb:3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Mi Perfil</Typography></Toolbar>
        </AppBar>
        <Paper sx={{ p:3, maxWidth:500 }}>
          {[['nombreCompleto','Nombre Completo'],['telefono','Teléfono'],['correo','Correo'],
            ['direccion','Dirección'],['preferencias','Preferencias']].map(([name, label]) => (
            <TextField key={name} fullWidth label={label} value={form[name] || ''}
              onChange={e => setForm({...form, [name]: e.target.value})} margin="normal"
              multiline={name === 'preferencias'} rows={name === 'preferencias' ? 3 : 1} />
          ))}
          <Button variant="contained" onClick={guardar} sx={{ mt:2 }}>Guardar Cambios</Button>
        </Paper>
      </Box>
    </Box>
  );
}
