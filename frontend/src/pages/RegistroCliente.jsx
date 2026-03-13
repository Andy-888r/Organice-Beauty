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
      login(res.data); navigate('/cliente');
    } catch (err) { setError(err.response?.data || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg, #0a0806 0%, #1a1210 40%, #0a0806 100%)' }}>
      <Paper elevation={0} sx={{ p:4, width:420, borderRadius:'20px',
        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(24px)',
        border:'1px solid rgba(243,236,227,0.12)',
        boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}
          sx={{ color:'#F3ECE3', fontFamily:'"Cormorant Garamond", Georgia, serif', letterSpacing:'0.12em' }}>
          Registro de Cliente
        </Typography>
        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          {[['usuario','Usuario'],['contrasena','Contraseña'],['nombreCompleto','Nombre Completo'],
            ['telefono','Teléfono'],['correo','Correo'],['direccion','Dirección']].map(([name, label]) => (
            <TextField key={name} fullWidth label={label} name={name} value={form[name]}
              type={name === 'contrasena' ? 'password' : 'text'}
              onChange={e => setForm({...form, [name]: e.target.value})} margin="dense" required
              sx={fieldStyle} />
          ))}
          <Button fullWidth type="submit" variant="contained" size="large"
            sx={{ mt:2, borderRadius:'12px', background:'linear-gradient(135deg, #91766E 0%, #C8A19C 100%)',
              fontFamily:'Georgia, serif', letterSpacing:'0.12em',
              '&:hover':{ background:'linear-gradient(135deg, #7a6159 0%, #b8908a 100%)' } }}
            disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
          </Button>
        </form>
        <Box mt={2} textAlign="center">
          <Typography variant="body2" sx={{ color:'rgba(243,236,227,0.40)', fontSize:'0.78rem' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color:'#C8A19C', textDecoration:'none', fontStyle:'italic' }}>Inicia sesión</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius:'10px', color:'#F3ECE3', background:'rgba(255,255,255,0.05)',
    '& fieldset':{ borderColor:'rgba(243,236,227,0.15)' },
    '&:hover fieldset':{ borderColor:'rgba(200,161,156,0.55)' },
    '&.Mui-focused fieldset':{ borderColor:'#C8A19C' },
  },
  '& .MuiInputLabel-root':{ color:'rgba(243,236,227,0.45)', fontSize:'0.88rem' },
  '& .MuiInputLabel-root.Mui-focused':{ color:'#C8A19C' },
};