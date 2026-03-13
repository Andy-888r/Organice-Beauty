import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function RegistroProveedor() {
  const [form, setForm] = useState({ nombre:'', rfc:'', usuario:'', contrasena:'', empresa:'', telefono:'', correo:'', direccion:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authAPI.registrarProveedor(form);
      login(res.data); navigate('/proveedor');
    } catch (err) { setError(err.response?.data || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg, #0a0806 0%, #1a1210 40%, #0a0806 100%)',
      position:'relative', overflow:'hidden',
      '&::before': {
        content:'""', position:'absolute', top:'-20%', left:'-10%',
        width:'500px', height:'500px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(145,118,110,0.12) 0%, transparent 70%)',
        pointerEvents:'none',
      },
      '&::after': {
        content:'""', position:'absolute', bottom:'-20%', right:'-10%',
        width:'600px', height:'600px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(200,161,156,0.10) 0%, transparent 70%)',
        pointerEvents:'none',
      },
    }}>
      <Paper elevation={0} sx={{
        p:'36px 44px', width:460, borderRadius:'20px',
        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(24px)',
        border:'1px solid rgba(243,236,227,0.12)',
        boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
        position:'relative', zIndex:1,
      }}>
        {/* Logo */}
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mb:3 }}>
          <Box sx={{
            width:70, height:70, borderRadius:'14px', overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'#F3ECE3', border:'1px solid rgba(243,236,227,0.30)',
            boxShadow:'0 6px 24px rgba(0,0,0,0.40)', mb:2,
          }}>
            <img src="/logo_elite_beauty.png" alt="Elite Beauty"
              style={{ width:'85%', height:'85%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; }} />
          </Box>
          <Typography sx={{
            fontFamily:'"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontSize:'1.30rem', fontWeight:600, color:'#F3ECE3',
            letterSpacing:'0.18em', textTransform:'uppercase', lineHeight:1,
          }}>Elite Beauty</Typography>
          <Box sx={{ width:100, height:'1px', background:'linear-gradient(90deg, transparent, rgba(200,161,156,0.8), transparent)', my:0.8 }} />
          <Typography sx={{ fontSize:'0.80rem', color:'rgba(243,236,227,0.50)', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Georgia, serif' }}>
            Registro de Proveedor
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb:2, borderRadius:2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {[['nombre','Nombre Completo'],['rfc','RFC'],['usuario','Usuario'],
            ['contrasena','Contraseña'],['empresa','Empresa'],['telefono','Teléfono'],
            ['correo','Correo'],['direccion','Dirección']].map(([name, label]) => (
            <TextField key={name} fullWidth label={label} name={name} value={form[name]}
              type={name === 'contrasena' ? 'password' : 'text'}
              onChange={e => setForm({...form, [name]: e.target.value})}
              margin="dense" required sx={fieldStyle} />
          ))}
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{
              mt:2.5, py:1.4, borderRadius:'12px',
              background:'linear-gradient(135deg, #91766E 0%, #C8A19C 100%)',
              fontSize:'0.82rem', letterSpacing:'0.15em', textTransform:'uppercase',
              fontFamily:'Georgia, serif', fontWeight:600,
              boxShadow:'0 4px 20px rgba(145,118,110,0.40)',
              '&:hover':{ background:'linear-gradient(135deg, #7a6159 0%, #b8908a 100%)', transform:'translateY(-1px)' },
              '&:active':{ transform:'translateY(0)' },
              '&.Mui-disabled':{ opacity:0.5 },
            }}>
            {loading ? <CircularProgress size={22} sx={{ color:'white' }} /> : 'Registrarme como Proveedor'}
          </Button>
        </form>

        <Box mt={2.5} textAlign="center">
          <Typography variant="body2" sx={{ color:'rgba(243,236,227,0.35)', fontSize:'0.78rem' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color:'#C8A19C', textDecoration:'none', fontStyle:'italic' }}>
              Inicia sesión
            </Link>
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




































