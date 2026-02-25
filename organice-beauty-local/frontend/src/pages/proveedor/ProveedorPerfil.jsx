import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, AppBar, Toolbar } from '@mui/material';
import { Assignment, Inventory, Person, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { proveedorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <Assignment />, path: '/proveedor' },
  { label: 'Mis Productos', icon: <Inventory />, path: '/proveedor/productos' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/proveedor/solicitudes' },
  { label: 'Mi Perfil', icon: <Person />, path: '/proveedor/perfil' },
];

export default function ProveedorPerfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({});

  useEffect(() => { proveedorAPI.perfil(user.id).then(r => setForm(r.data)); }, [user.id]);

  const guardar = async () => {
    await proveedorAPI.actualizar(user.id, form);
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
          {[['nombre','Nombre'],['empresa','Empresa'],['rfc','RFC'],['telefono','Teléfono'],
            ['correo','Correo'],['direccion','Dirección']].map(([name, label]) => (
            <TextField key={name} fullWidth label={label} value={form[name] || ''}
              onChange={e => setForm({...form, [name]: e.target.value})} margin="normal" />
          ))}
          <Button variant="contained" onClick={guardar} sx={{ mt:2 }}>Guardar Cambios</Button>
        </Paper>
      </Box>
    </Box>
  );
}
