import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
         Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
         TextField, FormControlLabel, Switch, AppBar, Toolbar, Select, MenuItem } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { productosAPI } from '../../services/api';
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

const EMPTY = { nombre: '', marca: '', categoria: '', descripcion: '', precio: '', activo: false };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [imagen, setImagen] = useState(null);
  const [editId, setEditId] = useState(null);

  const cargar = () => productosAPI.listarTodos().then(r => setProductos(r.data));

  useEffect(() => { cargar(); }, []);

  const handleOpen = (p = null) => {
    setEditId(p?.id || null);
    setForm(p ? { nombre: p.nombre, marca: p.marca, categoria: p.categoria,
      descripcion: p.descripcion, precio: p.precio, activo: p.activo } : EMPTY);
    setImagen(null);
    setOpen(true);
  };

  const handleGuardar = async () => {
    const fd = new FormData();
    fd.append('producto', JSON.stringify({ ...form, precio: parseFloat(form.precio) }));
    if (imagen) fd.append('imagen', imagen);
    try {
      if (editId) { await productosAPI.actualizar(editId, fd); toast.success('Producto actualizado'); }
      else { await productosAPI.crear(fd); toast.success('Producto creado'); }
      setOpen(false);
      cargar();
    } catch (e) { toast.error('Error al guardar producto'); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await productosAPI.eliminar(id);
    toast.success('Eliminado');
    cargar();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>Productos</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nuevo Producto</Button>
          </Toolbar>
        </AppBar>

        <Paper sx={{ mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#fce4ec' }}>
              <TableRow>
                {['Nombre','Marca','Categoría','Precio','Estado','Imagen','Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{p.marca}</TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell>${p.precio?.toFixed(2)}</TableCell>
                  <TableCell><Chip label={p.activo ? 'Activo' : 'Inactivo'} color={p.activo ? 'success' : 'default'} size="small" /></TableCell>
                  <TableCell>
                    {p.imagenPath && <img src={`http://localhost:8080${p.imagenPath}`} alt="img" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Edit />} onClick={() => handleOpen(p)}>Editar</Button>
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleEliminar(p.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} fullWidth />
            <TextField label="Marca" value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} fullWidth />
            <TextField label="Categoría" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} fullWidth />
            <TextField label="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} fullWidth multiline rows={2} />
            <TextField label="Precio" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} fullWidth />
            <FormControlLabel control={<Switch checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} />} label="Activo" />
            <Button variant="outlined" component="label">
              Subir imagen (Amazon S3)
              <input hidden accept="image/*" type="file" onChange={e => setImagen(e.target.files[0])} />
            </Button>
            {imagen && <Typography variant="caption">✅ {imagen.name}</Typography>}
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
