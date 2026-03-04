import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell,
         TableBody, Paper, Chip, Dialog, DialogTitle, DialogContent,
         DialogActions, TextField, FormControlLabel, Switch, AppBar, Toolbar } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { bannersAPI } from '../../services/api';

const MENU = [
  { label: 'Dashboard',   icon: <Assessment />,    path: '/admin' },
  { label: 'Productos',   icon: <Inventory />,     path: '/admin/productos' },
  { label: 'Banners',     icon: <Assessment />,    path: '/admin/banners' },
  { label: 'Clientes',    icon: <People />,        path: '/admin/clientes' },
  { label: 'Proveedores', icon: <Store />,         path: '/admin/proveedores' },
  { label: 'Inventario',  icon: <Inventory />,     path: '/admin/inventario' },
  { label: 'Solicitudes', icon: <Notifications />, path: '/admin/solicitudes' },
  { label: 'Reportes',    icon: <Assessment />,    path: '/admin/reportes' },
];

const EMPTY = { titulo: '', descripcion: '', orden: 0, activo: true };
const BASE   = 'http://localhost:8080/api';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [imagen,  setImagen]  = useState(null);
  const [editId,  setEditId]  = useState(null);

  const cargar = () => bannersAPI.listarTodos().then(r => setBanners(r.data));
  useEffect(() => { cargar(); }, []);

  const handleOpen = (b = null) => {
    setEditId(b?.id || null);
    setForm(b ? { titulo: b.titulo, descripcion: b.descripcion || '',
                  orden: b.orden, activo: b.activo } : EMPTY);
    setImagen(null);
    setOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim()) { toast.error('El título es obligatorio'); return; }
    const fd = new FormData();
    fd.append('banner', JSON.stringify({ ...form, orden: parseInt(form.orden) || 0 }));
    if (imagen) fd.append('imagen', imagen);
    try {
      if (editId) {
        await bannersAPI.actualizar(editId, fd);
        toast.success('Banner actualizado');
      } else {
        await bannersAPI.crear(fd);
        toast.success('Banner creado');
      }
      setOpen(false);
      cargar();
    } catch (e) { toast.error('Error al guardar banner'); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este banner?')) return;
    await bannersAPI.eliminar(id);
    toast.success('Banner eliminado');
    cargar();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Banners Promocionales
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
              Nuevo Banner
            </Button>
          </Toolbar>
        </AppBar>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 1 }}>
          Estas imágenes aparecen en el carrusel del inicio del cliente. No se mezclan con los productos del catálogo.
        </Typography>

        <Paper sx={{ mt: 1 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fce4ec' }}>
              <TableRow>
                {['Vista previa', 'Título', 'Descripción', 'Orden', 'Estado', 'Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay banners aún. Crea el primero con el botón de arriba.
                  </TableCell>
                </TableRow>
              )}
              {banners.map(b => (
                <TableRow key={b.id} hover>
                  <TableCell>
                    {b.imagenPath
                      ? <img src={`${BASE}${b.imagenPath}`} alt={b.titulo}
                             style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                      : <Box sx={{ width: 80, height: 50, bgcolor: '#fce4ec', borderRadius: 1,
                                   display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography fontSize={20}>🖼️</Typography>
                        </Box>
                    }
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{b.titulo}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', maxWidth: 220 }}>{b.descripcion}</TableCell>
                  <TableCell>{b.orden}</TableCell>
                  <TableCell>
                    <Chip label={b.activo ? 'Activo' : 'Inactivo'}
                          color={b.activo ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Edit />} onClick={() => handleOpen(b)}>Editar</Button>
                    <Button size="small" color="error" startIcon={<Delete />}
                            onClick={() => handleEliminar(b.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* ── Diálogo crear/editar ── */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Editar Banner' : 'Nuevo Banner Promocional'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>

            <TextField label="Título *" value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })} fullWidth />

            <TextField label="Descripción (opcional)" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              fullWidth multiline rows={2} />

            <TextField label="Orden (número)" type="number" value={form.orden}
              onChange={e => setForm({ ...form, orden: e.target.value })}
              helperText="Los banners se muestran de menor a mayor orden (0 = primero)"
              fullWidth inputProps={{ min: 0 }} />

            <FormControlLabel
              control={<Switch checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })} />}
              label="Mostrar en el inicio del cliente" />

            <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
              Subir imagen del banner
              <input hidden accept="image/*" type="file"
                onChange={e => setImagen(e.target.files[0])} />
            </Button>
            {imagen && (
              <Typography variant="caption" color="success.main">
                ✅ {imagen.name}
              </Typography>
            )}

          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}






