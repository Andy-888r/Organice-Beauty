import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions,
         Button, Typography, Box, LinearProgress } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';

export default function InactivityWatcher() {
  const [open, setOpen]         = useState(false);
  const [segundos, setSegundos] = useState(60);
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const intervalo  = React.useRef(null);

  const cerrarSesion = useCallback(() => {
    clearInterval(intervalo.current);
    setOpen(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const onWarning = useCallback(() => {
    setSegundos(60);
    setOpen(true);
    // Cuenta regresiva visual
    intervalo.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) { clearInterval(intervalo.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const onLogout = useCallback(() => {
    cerrarSesion();
  }, [cerrarSesion]);

  const { reiniciarTimer } = useInactivityTimer({ onWarning, onLogout });

  const handleSeguirActivo = () => {
    clearInterval(intervalo.current);
    setOpen(false);
    setSegundos(60);
    reiniciarTimer();
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: '1px solid rgba(160,82,45,0.20)' } }}>
      
      <DialogTitle sx={{ textAlign:'center', pb:1 }}>
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
          <AccessTime sx={{ fontSize:48, color:'#A0522D' }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>
            ¿Sigues ahí?
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign:'center', pb:1 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Tu sesión se cerrará por inactividad en:
        </Typography>

        {/* Contador */}
        <Typography variant="h3" fontWeight="bold" sx={{ color:'#A0522D', mb:1 }}>
          {segundos}s
        </Typography>

        {/* Barra de progreso */}
        <LinearProgress 
          variant="determinate" 
          value={(segundos / 60) * 100}
          sx={{ 
            height: 6, borderRadius: 3, mb:2,
            bgcolor: 'rgba(160,82,45,0.15)',
            '& .MuiLinearProgress-bar': { bgcolor: '#A0522D' }
          }} 
        />

        <Typography variant="caption" color="text.secondary">
          Se detectó inactividad por 4 minutos
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px:3, pb:3, gap:1 }}>
        <Button fullWidth variant="outlined" onClick={cerrarSesion}
          sx={{ borderColor:'#A0522D', color:'#A0522D', borderRadius:2 }}>
          Cerrar sesión
        </Button>
        <Button fullWidth variant="contained" onClick={handleSeguirActivo}
          sx={{ bgcolor:'#A0522D', '&:hover':{ bgcolor:'#8B4513' }, borderRadius:2 }}>
          Seguir activo
        </Button>
      </DialogActions>
    </Dialog>
  );
}