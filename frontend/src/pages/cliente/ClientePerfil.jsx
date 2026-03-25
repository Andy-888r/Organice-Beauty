import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  AppBar,
  Toolbar,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
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

// 🔥 Opciones de preferencias
const OPCIONES_PREFERENCIAS = [
  "Maquillaje",
  "Cuidado de piel",
  "Cabello",
  "Fragancias",
  "Uñas",
  "Tratamientos faciales"
];

export default function ClientePerfil() {

  const [form, setForm] = useState({
    nombreCompleto: '',
    telefono: '',
    correo: '',
    direccion: '',
    preferencias: [] // 👈 IMPORTANTE
  });

  const { user } = useAuth();

  //  Cargar datos del usuario
  useEffect(() => {
    clienteAPI.perfil(user.id).then(r => {
      const data = r.data;

      setForm({
        ...data,
        preferencias: Array.isArray(data.preferencias)
          ? data.preferencias
          : (data.preferencias ? data.preferencias.split(',') : [])
      });
    });
  }, [user.id]);

  //  Manejo de checkboxes
  const togglePreferencia = (opcion) => {
    const nuevas = form.preferencias.includes(opcion)
      ? form.preferencias.filter(p => p !== opcion)
      : [...form.preferencias, opcion];

    setForm({ ...form, preferencias: nuevas });
  };

  //  Guardar cambios
  const guardar = async () => {
    try {
      await clienteAPI.actualizar(user.id, form);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      
      <Sidebar items={MENU} />

      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        
        <AppBar
          position="static"
          elevation={0}
          sx={{
            mb:3,
            bgcolor:'#FFFFFF',
            borderBottom:'1px solid rgba(160,82,45,0.15)'
          }}
        >
          <Toolbar>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                color:'#3d2b26',
                fontFamily:'"Cormorant Garamond", Georgia, serif',
                letterSpacing:'0.05em'
              }}
            >
              Mi Perfil
            </Typography>
          </Toolbar>
        </AppBar>

        <Paper
          sx={{
            p:3,
            maxWidth:500,
            borderRadius:2,
            boxShadow:'0 2px 12px rgba(160,82,45,0.10)'
          }}
        >

          {/*  CAMPOS NORMALES */}
          {[
            ['nombreCompleto','Nombre Completo'],
            ['telefono','Teléfono'],
            ['correo','Correo'],
            ['direccion','Dirección']
          ].map(([name, label]) => (
            <TextField
              key={name}
              fullWidth
              label={label}
              value={form[name] || ''}
              onChange={e => setForm({...form, [name]: e.target.value})}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius:'10px',
                  '& fieldset': { borderColor:'rgba(160,82,45,0.30)' },
                  '&:hover fieldset': { borderColor:'#D4956A' },
                  '&.Mui-focused fieldset': { borderColor:'#A0522D' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color:'#A0522D' },
              }}
            />
          ))}

          {/*  PREFERENCIAS (NUEVO) */}
          <Typography
            sx={{ mt:2, mb:1, color:'#3d2b26', fontWeight:'bold' }}
          >
            Preferencias
          </Typography>

          <FormGroup>
            {OPCIONES_PREFERENCIAS.map((opcion) => (
              <FormControlLabel
                key={opcion}
                control={
                  <Checkbox
                    checked={form.preferencias?.includes(opcion)}
                    onChange={() => togglePreferencia(opcion)}
                    sx={{
                      color:'#A0522D',
                      '&.Mui-checked': { color:'#A0522D' }
                    }}
                  />
                }
                label={opcion}
              />
            ))}
          </FormGroup>

          {/*  BOTÓN */}
          <Button
            variant="contained"
            onClick={guardar}
            sx={{
              mt:2,
              borderRadius:'10px',
              bgcolor:'#A0522D',
              px:4,
              fontFamily:'Georgia, serif',
              letterSpacing:'0.08em',
              '&:hover':{ bgcolor:'#8B4513' }
            }}
          >
            Guardar Cambios
          </Button>

        </Paper>
      </Box>
    </Box>
  );
}