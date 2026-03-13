import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, AppBar, Toolbar } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { adminAPI } from '../../services/api';

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

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const cargar = () => adminAPI.clientes().then(r => setClientes(r.data));
  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    await adminAPI.eliminarCliente(id); toast.success('Cliente eliminado'); cargar();
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ mb:2, bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar><Typography variant="h5" fontWeight="bold" sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Clientes</Typography></Toolbar>
        </AppBar>
        <Paper sx={{ borderRadius:2, overflow:'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor:'#F5E6D8' }}>
              <TableRow>
                {['ID','Usuario','Nombre','Teléfono','Correo','Dirección','Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight:'bold', color:'#3d2b26' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map(c => (
                <TableRow key={c.id} hover sx={{ '&:hover':{ bgcolor:'rgba(245,230,216,0.30)' } }}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.usuario}</TableCell>
                  <TableCell>{c.nombreCompleto}</TableCell>
                  <TableCell>{c.telefono}</TableCell>
                  <TableCell>{c.correo}</TableCell>
                  <TableCell>{c.direccion}</TableCell>
                  <TableCell><Button size="small" color="error" startIcon={<Delete />} onClick={() => eliminar(c.id)}>Eliminar</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}




































