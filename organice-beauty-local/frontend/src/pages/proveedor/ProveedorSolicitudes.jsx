import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
         Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
         TextField, MenuItem, Select, FormControl, InputLabel, AppBar, Toolbar } from '@mui/material';
import { Add, Assignment, Inventory, Person, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { solicitudesAPI, proveedorAPI, productosAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <Assignment />, path: '/proveedor' },
  { label: 'Mis Productos', icon: <Inventory />, path: '/proveedor/productos' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/proveedor/solicitudes' },
  { label: 'Mi Perfil', icon: <Person />, path: '/proveedor/perfil' },
];

const estadoColor = { Pendiente: 'warning', Aprobada: 'success', Rechazada: 'error' };

export default function ProveedorSolicitudes() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ idProducto: '', cantidad: '', motivo: '' });

  const cargar = () => solicitudesAPI.listarPorProveedor(user.id).then(r => setSolicitudes(r.data));

  useEffect(() => {
    cargar();
    proveedorAPI.productos(user.id).then(r => setProductos(r.data));
  }, [user.id]);

  const enviar = async () => {
    try {
      await solicitudesAPI.crear({ idProveedor: user.id, idProducto: parseInt(form.idProducto),
                                    cantidad: parseInt(form.cantidad), motivo: form.motivo });
      toast.success('Solicitud enviada');
      setOpen(false);
      setForm({ idProducto:'', cantidad:'', motivo:'' });
      cargar();
    } catch (e) { toast.error('Error al enviar solicitud'); }
  };

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow:1 }}>Mis Solicitudes</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Nueva Solicitud</Button>
          </Toolbar>
        </AppBar>
        <Paper sx={{ mt:2 }}>
          <Table>
            <TableHead sx={{ bgcolor:'#fce4ec' }}>
              <TableRow>
                {['ID','Producto','Cantidad','Fecha','Motivo','Estado'].map(h => (
                  <TableCell key={h} sx={{ fontWeight:'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.nombreProducto}</TableCell>
                  <TableCell>{s.cantidad}</TableCell>
                  <TableCell>{new Date(s.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{s.motivo}</TableCell>
                  <TableCell><Chip label={s.estado} color={estadoColor[s.estado] || 'default'} size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nueva Solicitud de Entrada</DialogTitle>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, pt:1 }}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select value={form.idProducto} label="Producto" onChange={e => setForm({...form, idProducto: e.target.value})}>
                {productos.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Cantidad" type="number" value={form.cantidad}
              onChange={e => setForm({...form, cantidad: e.target.value})} fullWidth />
            <TextField label="Motivo" value={form.motivo}
              onChange={e => setForm({...form, motivo: e.target.value})} fullWidth multiline rows={2} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={enviar}>Enviar Solicitud</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
