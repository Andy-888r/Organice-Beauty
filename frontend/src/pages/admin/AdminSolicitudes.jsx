import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
         Button, Chip, Paper, AppBar, Toolbar } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { solicitudesAPI } from '../../services/api';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';

const MENU = [
  { label: 'Dashboard', icon: <Assessment />, path: '/admin' },
  { label: 'Productos', icon: <Inventory />, path: '/admin/productos' },
  { label: 'Clientes', icon: <People />, path: '/admin/clientes' },
  { label: 'Proveedores', icon: <Store />, path: '/admin/proveedores' },
  { label: 'Inventario', icon: <Inventory />, path: '/admin/inventario' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/admin/solicitudes' },
  { label: 'Reportes', icon: <Assessment />, path: '/admin/reportes' },
];

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);

  const cargar = async () => {
    const res = await solicitudesAPI.listarPendientes();
    setSolicitudes(res.data);
  };

  useEffect(() => { cargar(); }, []);

  const aprobar = async (id) => {
    try { await solicitudesAPI.aprobar(id); toast.success('Solicitud aprobada'); cargar(); }
    catch (e) { toast.error('Error al aprobar'); }
  };

  const rechazar = async (id) => {
    await solicitudesAPI.rechazar(id);
    toast.info('Solicitud rechazada');
    cargar();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Solicitudes de Entrada</Typography></Toolbar>
        </AppBar>
        <Paper>
          <Table>
            <TableHead sx={{ bgcolor: '#fce4ec' }}>
              <TableRow>
                {['ID','Proveedor','Producto','Cantidad','Fecha','Motivo','Estado','Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.nombreProveedor}</TableCell>
                  <TableCell>{s.nombreProducto}</TableCell>
                  <TableCell>{s.cantidad}</TableCell>
                  <TableCell>{new Date(s.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{s.motivo}</TableCell>
                  <TableCell>
                    <Chip label={s.estado} color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" color="success" startIcon={<CheckCircle />}
                      onClick={() => aprobar(s.id)} sx={{ mr: 1 }}>Aprobar</Button>
                    <Button size="small" color="error" startIcon={<Cancel />}
                      onClick={() => rechazar(s.id)}>Rechazar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {solicitudes.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center">No hay solicitudes pendientes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}
