import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, AppBar, Toolbar } from '@mui/material';
import { ShoppingCart, History, Person } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { clienteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio',    icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar',   icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />,      path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />,       path: '/cliente/perfil' },
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
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0}
          sx={{ mb:3, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold"
              sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif', letterSpacing:'0.05em' }}>
              Mi Perfil
            </Typography>
          </Toolbar>
        </AppBar>

        <Paper sx={{ p:3, maxWidth:500, borderRadius:2, boxShadow:'0 2px 12px rgba(160,82,45,0.10)' }}>
          {[['nombreCompleto','Nombre Completo'],['telefono','Teléfono'],
            ['correo','Correo'],['direccion','Dirección'],['preferencias','Preferencias']].map(([name, label]) => (
            <TextField key={name} fullWidth label={label} value={form[name] || ''}
              onChange={e => setForm({...form, [name]: e.target.value})} margin="normal"
              multiline={name === 'preferencias'} rows={name === 'preferencias' ? 3 : 1}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius:'10px',
                  '& fieldset': { borderColor:'rgba(160,82,45,0.30)' },
                  '&:hover fieldset': { borderColor:'#D4956A' },
                  '&.Mui-focused fieldset': { borderColor:'#A0522D' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color:'#A0522D' },
              }} />
          ))}
          <Button variant="contained" onClick={guardar}
            sx={{ mt:2, borderRadius:'10px', bgcolor:'#A0522D', px:4,
              fontFamily:'Georgia, serif', letterSpacing:'0.08em',
              '&:hover':{ bgcolor:'#8B4513' } }}>
            Guardar Cambios
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}




































