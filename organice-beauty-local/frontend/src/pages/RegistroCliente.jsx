import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function RegistroCliente() {
  const [form, setForm] = useState({ usuario:'', contrasena:'', nombreCompleto:'', telefono:'', correo:'', direccion:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authAPI.registrarCliente(form);
      login(res.data);
      navigate('/cliente');
    } catch (err) { setError(err.response?.data || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
               background:'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' }}>
      <Paper elevation={6} sx={{ p:4, width:420, borderRadius:3 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" color="primary" mb={2}>Registro de Cliente</Typography>
        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          {[['usuario','Usuario'],['contrasena','Contraseña'],['nombreCompleto','Nombre Completo'],
            ['telefono','Teléfono'],['correo','Correo'],['direccion','Dirección']].map(([name, label]) => (
            <TextField key={name} fullWidth label={label} name={name} value={form[name]}
              type={name === 'contrasena' ? 'password' : 'text'}
              onChange={e => setForm({...form, [name]: e.target.value})} margin="dense" required />
          ))}
          <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt:2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></Typography>
        </Box>
      </Paper>
    </Box>
  );
}
