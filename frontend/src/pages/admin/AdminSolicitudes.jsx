import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
         Button, Chip, Paper, AppBar, Toolbar } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { solicitudesAPI } from '../../services/api';

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

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const cargar = async () => { const res = await solicitudesAPI.listarPendientes(); setSolicitudes(res.data); };
  useEffect(() => { cargar(); }, []);

  const aprobar = async (id) => {
    try { await solicitudesAPI.aprobar(id); toast.success('Solicitud aprobada'); cargar(); }
    catch (e) { toast.error('Error al aprobar'); }
  };
  const rechazar = async (id) => { await solicitudesAPI.rechazar(id); toast.info('Solicitud rechazada'); cargar(); };

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ mb:3, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar><Typography variant="h5" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Solicitudes de Entrada</Typography></Toolbar>
        </AppBar>
        <Paper sx={{ borderRadius:2, overflow:'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor:'#F5E6D8' }}>
              <TableRow>
                {['ID','Proveedor','Producto','Cantidad','Fecha','Motivo','Estado','Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight:'bold', color:'#3d2b26' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.map(s => (
                <TableRow key={s.id} hover sx={{ '&:hover':{ bgcolor:'rgba(245,230,216,0.30)' } }}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.nombreProveedor}</TableCell>
                  <TableCell>{s.nombreProducto}</TableCell>
                  <TableCell>{s.cantidad}</TableCell>
                  <TableCell>{new Date(s.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{s.motivo}</TableCell>
                  <TableCell><Chip label={s.estado} color="warning" size="small" /></TableCell>
                  <TableCell>
                    <Button size="small" color="success" startIcon={<CheckCircle />} onClick={() => aprobar(s.id)} sx={{ mr:1 }}>Aprobar</Button>
                    <Button size="small" color="error" startIcon={<Cancel />} onClick={() => rechazar(s.id)}>Rechazar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {solicitudes.length===0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py:4, color:'text.secondary' }}>No hay solicitudes pendientes</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}




































