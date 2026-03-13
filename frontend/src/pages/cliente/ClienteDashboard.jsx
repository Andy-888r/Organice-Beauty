import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, CardActionArea,
         AppBar, Toolbar, Chip, IconButton } from '@mui/material';
import { ShoppingCart, History, Person, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { productosAPI, bannersAPI } from '../../services/api';

const MENU = [
  { label: 'Inicio',    icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar',   icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />,      path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />,       path: '/cliente/perfil' },
];
const BASE = 'http://localhost:8080/api';

export default function ClienteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banners, setBanners]         = useState([]);
  const [productos, setProductos]     = useState([]);
  const [slideActual, setSlideActual] = useState(0);

  useEffect(() => {
    bannersAPI.listarActivos().then(r => setBanners(r.data)).catch(() => {});
    productosAPI.listarActivos().then(r => setProductos(r.data)).catch(() => {});
  }, []);

  const nuevos   = [...productos].reverse().slice(0, 6);
  const anterior = () => setSlideActual(s => (s - 1 + banners.length) % banners.length);
  const siguiente= () => setSlideActual(s => (s + 1) % banners.length);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(siguiente, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const slide = banners[slideActual];

  return (
    <Box sx={{ display: 'flex', bgcolor: '#FAF7F4', minHeight: '100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <AppBar position="static" elevation={0}
          sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid rgba(160,82,45,0.15)', px: 3, pt: 1 }}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#3d2b26', fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.05em' }}>
              ¡Hola, {user?.nombre}!
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ px: 3, pb: 4, pt: 2 }}>
          {/* Banner carrusel */}
          {banners.length > 0 ? (
            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden',
              height: 360, mb: 4, boxShadow: '0 4px 24px rgba(160,82,45,0.20)' }}>
              <Box component="img" src={`${BASE}${slide.imagenPath}`} alt={slide.titulo}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s' }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.70))' }} />
              <Box sx={{ position: 'absolute', bottom: 28, left: 32, color: 'white' }}>
                {slide.titulo && <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)', mb: 0.5 }}>{slide.titulo}</Typography>}
                {slide.descripcion && <Typography variant="body1" sx={{ opacity: 0.9 }}>{slide.descripcion}</Typography>}
              </Box>
              {banners.length > 1 && (
                <>
                  <IconButton onClick={anterior} sx={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', bgcolor:'rgba(243,236,227,0.25)', color:'white', '&:hover':{ bgcolor:'rgba(243,236,227,0.40)' } }}><ChevronLeft /></IconButton>
                  <IconButton onClick={siguiente} sx={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', bgcolor:'rgba(243,236,227,0.25)', color:'white', '&:hover':{ bgcolor:'rgba(243,236,227,0.40)' } }}><ChevronRight /></IconButton>
                  <Box sx={{ position:'absolute', bottom:12, right:20, display:'flex', gap:0.8 }}>
                    {banners.map((_, i) => (
                      <Box key={i} onClick={() => setSlideActual(i)} sx={{ width: i===slideActual?20:8, height:8, borderRadius:4, bgcolor: i===slideActual?'#F3ECE3':'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.3s' }} />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ height:300, borderRadius:3, mb:4, display:'flex', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg, #F3ECE3, #F5E6D8)', border:'2px dashed #D4956A' }}>
              <Box sx={{ textAlign:'center' }}>
                <Typography variant="h2">💄</Typography>
                <Typography variant="h6" sx={{ color:'#A0522D' }} fontWeight="bold">Elite Beauty</Typography>
                <Typography variant="body2" color="text.secondary">Agrega banners desde el panel de administrador</Typography>
              </Box>
            </Box>
          )}

          {/* Nuevos productos */}
          {nuevos.length > 0 && (
            <>
              <Box sx={{ display:'flex', alignItems:'center', mb:2, gap:1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Nuevos productos</Typography>
                <Chip label="Recién agregados" size="small" sx={{ bgcolor:'#F5E6D8', color:'#A0522D', fontWeight:'bold' }} />
              </Box>
              <Grid container spacing={2}>
                {nuevos.map(p => (
                  <Grid item xs={12} sm={6} md={4} key={p.id}>
                    <Card sx={{ borderRadius:2, overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s',
                      '&:hover':{ transform:'translateY(-4px)', boxShadow:'0 8px 24px rgba(160,82,45,0.20)' } }}>
                      <CardActionArea onClick={() => navigate('/cliente/compras')}>
                        {p.imagenPath
                          ? <CardMedia component="img" height="160" image={`${BASE}${p.imagenPath}`} alt={p.nombre} sx={{ objectFit:'cover' }} />
                          : <Box sx={{ height:160, bgcolor:'#F5E6D8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <Typography fontSize={48}>💄</Typography></Box>
                        }
                        <CardContent sx={{ pb:2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ color:'#3d2b26' }}>{p.nombre}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>{p.marca} · {p.categoria}</Typography>
                          <Typography variant="h6" fontWeight="bold" mt={0.5} sx={{ color:'#A0522D' }}>${p.precio?.toFixed(2)}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}




































