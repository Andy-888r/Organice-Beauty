import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
         Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
         TextField, FormControlLabel, Switch, AppBar, Toolbar } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import { Assessment, People, Store, Inventory, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { productosAPI } from '../../services/api';

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

const EMPTY = { nombre:'', marca:'', categoria:'', descripcion:'', precio:'', activo:false };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const [imagen, setImagen] = useState(null);
  const [editId, setEditId] = useState(null);

  const cargar = () => productosAPI.listarTodos().then(r => setProductos(r.data));
  useEffect(() => { cargar(); }, []);

  const handleOpen = (p = null) => {
    setEditId(p?.id || null);
    setForm(p ? { nombre:p.nombre, marca:p.marca, categoria:p.categoria, descripcion:p.descripcion, precio:p.precio, activo:p.activo } : EMPTY);
    setImagen(null); setOpen(true);
  };

  const handleGuardar = async () => {
    const fd = new FormData();
    fd.append('producto', JSON.stringify({ ...form, precio: parseFloat(form.precio) }));
    if (imagen) fd.append('imagen', imagen);
    try {
      if (editId) { await productosAPI.actualizar(editId, fd); toast.success('Producto actualizado'); }
      else { await productosAPI.crear(fd); toast.success('Producto creado'); }
      setOpen(false); cargar();
    } catch (e) { toast.error('Error al guardar producto'); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await productosAPI.eliminar(id); toast.success('Eliminado'); cargar();
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow:1, color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Productos</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
              sx={{ bgcolor:'#A0522D', '&:hover':{ bgcolor:'#8B4513' } }}>Nuevo Producto</Button>
          </Toolbar>
        </AppBar>

        <Paper sx={{ mt:2, borderRadius:2, overflow:'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor:'#F5E6D8' }}>
              <TableRow>
                {['Nombre','Marca','Categoría','Precio','Estado','Imagen','Acciones'].map(h => (
                  <TableCell key={h} sx={{ fontWeight:'bold', color:'#3d2b26' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.map(p => (
                <TableRow key={p.id} hover sx={{ '&:hover':{ bgcolor:'rgba(245,230,216,0.30)' } }}>
                  <TableCell sx={{ fontWeight:500 }}>{p.nombre}</TableCell>
                  <TableCell>{p.marca}</TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell sx={{ color:'#A0522D', fontWeight:'bold' }}>${p.precio?.toFixed(2)}</TableCell>
                  <TableCell><Chip label={p.activo?'Activo':'Inactivo'} color={p.activo?'success':'default'} size="small" /></TableCell>
                  <TableCell>
                    {p.imagenPath && <img src={`http://localhost:8080/api${p.imagenPath}`} alt="img" style={{ width:40, height:40, objectFit:'cover', borderRadius:6 }} />}
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Edit />} onClick={() => handleOpen(p)} sx={{ color:'#A0522D' }}>Editar</Button>
                    <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleEliminar(p.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>{editId?'Editar Producto':'Nuevo Producto'}</DialogTitle>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, pt:1 }}>
            <TextField label="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} fullWidth />
            <TextField label="Marca" value={form.marca} onChange={e => setForm({...form, marca:e.target.value})} fullWidth />
            <TextField label="Categoría" value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})} fullWidth />
            <TextField label="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} fullWidth multiline rows={2} />
            <TextField label="Precio" type="number" value={form.precio}
              onChange={e => { const val=e.target.value; if(val===''||(Number.isInteger(Number(val))&&parseInt(val)>=1)){setForm({...form,precio:val})}}}
              inputProps={{ min:1, step:1 }} fullWidth />
            <FormControlLabel control={<Switch checked={form.activo} onChange={e => setForm({...form, activo:e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked':{ color:'#A0522D' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':{ bgcolor:'#D4956A' } }} />} label="Activo" />
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}
              sx={{ borderColor:'#A0522D', color:'#A0522D', '&:hover':{ borderColor:'#D4956A', bgcolor:'rgba(212,149,106,0.08)' } }}>
              Subir imagen
              <input hidden accept="image/*" type="file" onChange={e => setImagen(e.target.files[0])} />
            </Button>
            {imagen && <Typography variant="caption" color="success.main">✅ {imagen.name}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} sx={{ color:'#A0522D' }}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar} sx={{ bgcolor:'#A0522D', '&:hover':{ bgcolor:'#8B4513' } }}>Guardar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}




































