import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress,
         InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ usuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Estado para controlar si la contraseña es visible o no
  const [verContrasena, setVerContrasena] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data);
      const rol = res.data.rol.toLowerCase();
      navigate(`/${rol}`);
    } catch (err) {
      setError(err.response?.data || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' }}>
      <Paper elevation={6} sx={{ p: 4, width: 380, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" color="primary" mb={1}>
          💄 Organice Beauty
        </Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
          Inicia sesión en tu cuenta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Usuario" name="usuario" value={form.usuario}
            onChange={handleChange} margin="normal" required autoFocus />

          <TextField
            fullWidth
            label="Contraseña"
            name="contrasena"
            //Campo de contraseña con botón para mostrar/ocultar 
            type={verContrasena ? 'text' : 'password'}
            value={form.contrasena}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setVerContrasena(!verContrasena)}
                    edge="end"
                    title={verContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                   {verContrasena ? <span style={{ color: '#C2185B', fontWeight: 'bold' }}>✕</span> : '👁️'}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button fullWidth type="submit" variant="contained" size="large"
            sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            ¿Nuevo cliente? <Link to="/registro/cliente">Regístrate aquí</Link>
          </Typography>
          <Typography variant="body2" mt={1}>
            ¿Eres proveedor? <Link to="/registro/proveedor">Registro de proveedor</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}