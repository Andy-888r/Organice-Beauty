import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
         Paper, Button, Chip, AppBar, Toolbar } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { adminAPI } from '../../services/api';
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

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const cargar = () => adminAPI.proveedores().then(r => setProveedores(r.data));
  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar proveedor?')) return;
    await adminAPI.eliminarProveedor(id);
    toast.success('Proveedor eliminado');
    cargar();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
          <Toolbar><Typography variant="h5" fontWeight="bold">Proveedores</Typography></Toolbar>
        </AppBar>
        <Paper>
          <Table>
            <TableHead sx={{ bgcolor: '#fce4ec' }}>
              <TableRow>
                {['Nombre','RFC','Empresa','Teléfono','Correo','Estado','Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {proveedores.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{p.rfc}</TableCell>
                  <TableCell>{p.empresa}</TableCell>
                  <TableCell>{p.telefono}</TableCell>
                  <TableCell>{p.correo}</TableCell>
                  <TableCell><Chip label={p.activo ? 'Activo' : 'Inactivo'} color={p.activo ? 'success' : 'default'} size="small" /></TableCell>
                  <TableCell>
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => eliminar(p.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}
