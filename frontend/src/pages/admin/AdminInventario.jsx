import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
         Paper, Chip, AppBar, Toolbar, Tabs, Tab } from '@mui/material';
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

const estadoColor = { 'OK':'success', 'BAJO':'warning', 'SIN STOCK':'error' };

export default function AdminInventario() {
  const [inventario, setInventario] = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    inventarioAPI.listar().then(r => setInventario(r.data));
    inventarioAPI.historial().then(r => setHistorial(r.data));
  }, []);

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ mb:2, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar><Typography variant="h5" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Inventario</Typography></Toolbar>
        </AppBar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb:2, '& .MuiTab-root':{ color:'#A0522D' }, '& .Mui-selected':{ color:'#3d2b26 !important' }, '& .MuiTabs-indicator':{ bgcolor:'#A0522D' } }}>
          <Tab label="Stock Actual" />
          <Tab label="Historial de Movimientos" />
        </Tabs>
        {tab===0 && (
          <Paper sx={{ borderRadius:2, overflow:'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor:'#F5E6D8' }}>
                <TableRow>{['Producto','Stock','Mínimo','Estado'].map(h => <TableCell key={h} sx={{ fontWeight:'bold', color:'#3d2b26' }}>{h}</TableCell>)}</TableRow>
              </TableHead>
              <TableBody>
                {inventario.map((i,idx) => (
                  <TableRow key={idx} hover sx={{ '&:hover':{ bgcolor:'rgba(245,230,216,0.30)' } }}>
                    <TableCell>{i.producto?.nombre}</TableCell>
                    <TableCell>{i.stock}</TableCell>
                    <TableCell>{i.minimo}</TableCell>
                    <TableCell><Chip label={i.estado} color={estadoColor[i.estado]||'default'} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
        {tab===1 && (
          <Paper sx={{ borderRadius:2, overflow:'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor:'#F5E6D8' }}>
                <TableRow>{['Fecha','Producto','Tipo','Cantidad','Motivo'].map(h => <TableCell key={h} sx={{ fontWeight:'bold', color:'#3d2b26' }}>{h}</TableCell>)}</TableRow>
              </TableHead>
              <TableBody>
                {historial.map((h,idx) => (
                  <TableRow key={idx} hover sx={{ '&:hover':{ bgcolor:'rgba(245,230,216,0.30)' } }}>
                    <TableCell>{new Date(h.fecha).toLocaleString()}</TableCell>
                    <TableCell>{h.producto?.nombre}</TableCell>
                    <TableCell><Chip label={h.tipo} color={h.tipo==='Entrada'?'success':'error'} size="small" /></TableCell>
                    <TableCell>{h.cantidad}</TableCell>
                    <TableCell>{h.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
}




































