import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia,
         Dialog, DialogTitle, DialogContent, DialogActions,
         TextField, FormControlLabel, Switch, AppBar, Toolbar,
         Avatar, Chip, IconButton, Tooltip } from '@mui/material';
import { Add, Edit, Delete, CloudUpload, Phone, Email, Business } from '@mui/icons-material';
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

const EMPTY = { nombre:'', empresa:'', telefono:'', correo:'', descripcion:'', activo:true };
const BASE   = 'http://localhost:8080/api';

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const [logo, setLogo]   = useState(null);
  const [editId, setEditId] = useState(null);

  const cargar = () => adminAPI.proveedores().then(r => setProveedores(r.data));
  useEffect(() => { cargar(); }, []);

  const handleOpen = (p = null) => {
    setEditId(p?.id || null);
    setForm(p ? { nombre:p.nombre||'', empresa:p.empresa||'', telefono:p.telefono||'', correo:p.correo||'', descripcion:p.descripcion||'', activo:p.activo??true } : EMPTY);
    setLogo(null); setOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    const fd = new FormData();
    fd.append('proveedor', JSON.stringify(form));
    if (logo) fd.append('logo', logo);
    try {
      if (editId) { await adminAPI.actualizarProveedor(editId, fd); toast.success('Proveedor actualizado'); }
      else { await adminAPI.crearProveedor(fd); toast.success('Proveedor creado'); }
      setOpen(false); cargar();
    } catch (e) { toast.error('Error al guardar proveedor'); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    await adminAPI.eliminarProveedor(id); toast.success('Proveedor eliminado'); cargar();
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#FAF7F4', minHeight:'100vh' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor:'#FFFFFF', borderBottom:'1px solid rgba(160,82,45,0.15)' }}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow:1, color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>Proveedores</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}
              sx={{ bgcolor:'#A0522D', '&:hover':{ bgcolor:'#8B4513' } }}>Nuevo Proveedor</Button>
          </Toolbar>
        </AppBar>
        <Typography variant="body2" color="text.secondary" sx={{ mb:3, px:1, mt:1 }}>Gestiona las empresas y marcas que surten tus productos.</Typography>

        <Grid container spacing={3}>
          {proveedores.length===0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign:'center', py:8, color:'text.secondary' }}>
                <Typography variant="h2">🏭</Typography>
                <Typography variant="h6" mt={1}>No hay proveedores aún</Typography>
                <Typography variant="body2">Agrega el primero con el botón de arriba</Typography>
              </Box>
            </Grid>
          )}
          {proveedores.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card sx={{ borderRadius:3, overflow:'hidden', height:'100%',
                boxShadow:'0 2px 12px rgba(160,82,45,0.10)', transition:'transform 0.2s, box-shadow 0.2s',
                '&:hover':{ transform:'translateY(-3px)', boxShadow:'0 6px 20px rgba(160,82,45,0.20)' } }}>
                {p.logoPath
                  ? <CardMedia component="img" height="140" image={`${BASE}${p.logoPath}`} alt={p.nombre} sx={{ objectFit:'contain', bgcolor:'#FAF7F4', p:2 }} />
                  : <Box sx={{ height:140, bgcolor:'#F5E6D8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Avatar sx={{ width:72, height:72, bgcolor:'#A0522D', fontSize:28 }}>{p.nombre?.charAt(0).toUpperCase()}</Avatar>
                    </Box>
                }
                <CardContent sx={{ p:2.5 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight:1.2, color:'#3d2b26' }}>{p.nombre}</Typography>
                    <Chip label={p.activo?'Activo':'Inactivo'} color={p.activo?'success':'default'} size="small" />
                  </Box>
                  {p.empresa && <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:0.5 }}><Business fontSize="small" sx={{ color:'#A0522D', fontSize:16 }} /><Typography variant="body2" color="text.secondary">{p.empresa}</Typography></Box>}
                  {p.telefono && <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:0.5 }}><Phone fontSize="small" sx={{ color:'#A0522D', fontSize:16 }} /><Typography variant="body2" color="text.secondary">{p.telefono}</Typography></Box>}
                  {p.correo && <Box sx={{ display:'flex', alignItems:'center', gap:0.5, mb:0.5 }}><Email fontSize="small" sx={{ color:'#A0522D', fontSize:16 }} /><Typography variant="body2" color="text.secondary" noWrap>{p.correo}</Typography></Box>}
                  {p.descripcion && <Typography variant="body2" color="text.secondary" sx={{ mt:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.descripcion}</Typography>}
                  <Box sx={{ display:'flex', gap:1, mt:2 }}>
                    <Button size="small" variant="outlined" startIcon={<Edit />} sx={{ flex:1, borderColor:'#A0522D', color:'#A0522D', '&:hover':{ borderColor:'#D4956A', bgcolor:'rgba(212,149,106,0.08)' } }} onClick={() => handleOpen(p)}>Editar</Button>
                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => handleEliminar(p.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color:'#3d2b26', fontFamily:'"Cormorant Garamond", Georgia, serif' }}>{editId?'Editar Proveedor':'Nuevo Proveedor'}</DialogTitle>
          <DialogContent sx={{ display:'flex', flexDirection:'column', gap:2, pt:2 }}>
            <TextField label="Nombre *" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} fullWidth />
            <TextField label="Empresa / Marca" value={form.empresa} onChange={e => setForm({...form, empresa:e.target.value})} fullWidth />
            <TextField label="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono:e.target.value})} fullWidth />
            <TextField label="Correo" value={form.correo} onChange={e => setForm({...form, correo:e.target.value})} fullWidth />
            <TextField label="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} fullWidth multiline rows={3} placeholder="Describe los productos o servicios que ofrece este proveedor..." />
            <FormControlLabel control={<Switch checked={form.activo} onChange={e => setForm({...form, activo:e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked':{ color:'#A0522D' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':{ bgcolor:'#D4956A' } }} />} label="Proveedor activo" />
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}
              sx={{ borderColor:'#A0522D', color:'#A0522D', '&:hover':{ borderColor:'#D4956A', bgcolor:'rgba(212,149,106,0.08)' } }}>
              Subir logo del proveedor
              <input hidden accept="image/*" type="file" onChange={e => setLogo(e.target.files[0])} />
            </Button>
            {logo && <Typography variant="caption" color="success.main">✅ {logo.name}</Typography>}
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




































