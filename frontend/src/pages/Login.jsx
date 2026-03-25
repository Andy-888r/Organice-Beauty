import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, Alert,
  CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ usuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data);
      const rol = res.data.rol?.toLowerCase();
     navigate(rol === 'admin' ? '/admin' : '/cliente');
    } catch (err) {
      setError(err.response?.data || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #0a0806 0%, #1a1210 40%, #0a0806 100%)',
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: '-20%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(145,118,110,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      },
      '&::after': {
        content: '""', position: 'absolute', bottom: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,161,156,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      },
    }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(145,118,110,0.03) 60px, rgba(145,118,110,0.03) 61px)',
        pointerEvents: 'none',
      }} />

      <Paper elevation={0} sx={{
        p: '40px 44px', width: 420, borderRadius: '20px',
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(243,236,227,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(243,236,227,0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            width: 90, height: 90, borderRadius: '18px', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F3ECE3', border: '1px solid rgba(243,236,227,0.30)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', mb: 2.5,
          }}>
            <img src="/logo_elite_beauty.png" alt="Elite Beauty"
              style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; }} />
          </Box>
          <Typography sx={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontSize: '1.55rem', fontWeight: 600, color: '#F3ECE3',
            letterSpacing: '0.20em', textTransform: 'uppercase', lineHeight: 1, mb: 0.5,
          }}>Elite Beauty</Typography>
          <Box sx={{ width: 120, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(200,161,156,0.8), transparent)', my: 1 }} />
          <Typography sx={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: '0.75rem', fontStyle: 'italic',
            color: 'rgba(243,236,227,0.45)', letterSpacing: '0.25em',
          }}>ventas y inventarios</Typography>
        </Box>

        <Typography sx={{
          fontSize: '0.82rem', color: 'rgba(243,236,227,0.50)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          textAlign: 'center', mb: 3, fontFamily: 'Georgia, serif',
        }}>Iniciar sesión</Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Usuario" name="usuario" value={form.usuario}
            onChange={handleChange} margin="normal" required autoFocus sx={fieldStyle} />
          <TextField fullWidth label="Contraseña" name="contrasena"
            type={verContrasena ? 'text' : 'password'} value={form.contrasena}
            onChange={handleChange} margin="normal" required sx={fieldStyle}
            InputProps={{ endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setVerContrasena(!verContrasena)} edge="end"
                  sx={{ color: 'rgba(243,236,227,0.45)', '&:hover': { color: '#C8A19C' } }}>
                  {verContrasena ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            )}} />
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{
              mt: 3, mb: 1, py: 1.4, borderRadius: '12px',
              background: 'linear-gradient(135deg, #91766E 0%, #C8A19C 100%)',
              fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              fontFamily: 'Georgia, serif', fontWeight: 600,
              boxShadow: '0 4px 20px rgba(145,118,110,0.40)',
              border: '1px solid rgba(243,236,227,0.10)', transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #7a6159 0%, #b8908a 100%)',
                boxShadow: '0 6px 28px rgba(145,118,110,0.55)', transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
              '&.Mui-disabled': { opacity: 0.5 },
            }}>
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Entrar'}
          </Button>
        </form>

        <Box mt={2.5} textAlign="center">
          <Typography variant="body2" sx={{ color: 'rgba(243,236,227,0.35)', fontSize: '0.78rem' }}>
            ¿Nuevo cliente?{' '}
            <Link to="/registro/cliente" style={{ color: '#C8A19C', textDecoration: 'none', fontStyle: 'italic' }}>
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', color: '#F3ECE3', background: 'rgba(255,255,255,0.05)',
    '& fieldset': { borderColor: 'rgba(243,236,227,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(200,161,156,0.55)' },
    '&.Mui-focused fieldset': { borderColor: '#C8A19C' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(243,236,227,0.45)', fontSize: '0.88rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#C8A19C' },
};