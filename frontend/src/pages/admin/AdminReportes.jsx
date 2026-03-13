import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, AppBar, Toolbar, Grid, Card, CardContent } from '@mui/material';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { inventarioAPI } from '../../services/api';

const MENU = [
  { label:'Dashboard',   icon:<Assessment />,    path:'/admin' },
  { label:'Productos',   icon:<Inventory />,     path:'/admin/productos' },
  { label:'Banners',     icon:<Assessment />,    path:'/admin/banners' },
  { label:'Clientes',    icon:<People />,        path:'/admin/clientes' },
  { label:'Proveedores', icon:<Store />,         path:'/admin/proveedores' },
  { label:'Inventario',  icon:<Inventory />,     path:'/admin/inventario' },
  { label:'Solicitudes', icon:<Notifications />, path:'/admin/solicitudes' },
  { label:'Reportes',    icon:<Assessment />,    path:'/admin/reportes' },
];

export default function AdminReportes() {
  const [bajoStock, setBajoStock] = useState([]);
  useEffect(() => { inventarioAPI.listar().then(r => { setBajoStock(r.data.filter(i => i.estado !== 'OK')); }); }, []);

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ mb:3, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar><Typography variant="h5" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Reportes</Typography></Toolbar>
        </AppBar>
        <Typography variant="h6" mb={2} sx={{ color:'#3d2b26' }}>Productos con Stock Bajo o Sin Stock</Typography>
        <Grid container spacing={2}>
          {bajoStock.map((i,idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ borderLeft:`4px solid ${i.estado==='SIN STOCK'?'#c0392b':'#e67e22'}`, borderRadius:2, bgcolor:'#FFFFFF', boxShadow:'0 2px 10px rgba(160,82,45,0.10)' }}>
                <CardContent>
                  <Typography fontWeight="bold" sx={{ color:'#3d2b26' }}>{i.producto?.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">Stock: {i.stock} / Mínimo: {i.minimo}</Typography>
                  <Typography variant="body2" sx={{ color: i.estado==='SIN STOCK'?'#c0392b':'#e67e22' }}>Estado: {i.estado}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {bajoStock.length===0 && <Grid item xs={12}><Typography sx={{ color:'#6a9b7a' }}>✅ Todos los productos tienen stock suficiente</Typography></Grid>}
        </Grid>
      </Box>
    </Box>
  );
}




































