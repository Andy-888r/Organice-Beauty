import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch } from '@mui/material';
import { Assessment, Inventory, People, Store, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { adminAPI } from '../../services/api';
import { MARBLE_STYLES } from '../../styles/marble';

const MENU = [
  { label:'Inicio',      icon:<Assessment />,    path:'/admin' },
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

const extraStyles = `
  .eb-hint { font-family:'Jost',sans-serif; font-size:0.75rem; color:#55883B; letter-spacing:0.06em; margin-bottom:24px; margin-top:-12px; }
  .eb-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
  .eb-prov-card { border-radius:2px; display:flex; flex-direction:column; transition:transform 0.2s, box-shadow 0.2s; }
  .eb-prov-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(44,74,30,0.14); }
  .eb-prov-logo { width:100%; height:130px; object-fit:contain; background:rgba(248,252,244,0.90); padding:16px; display:block; }
  .eb-prov-avatar { width:100%; height:130px; background:rgba(85,136,59,0.10); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:2.8rem; font-weight:600; color:#55883B; }
  .eb-prov-body { padding:20px 22px; flex:1; display:flex; flex-direction:column; background:rgba(248,252,244,0.85); }
  .eb-prov-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
  .eb-prov-name { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:600; color:#2C4A1E; }
  .eb-chip-act   { display:inline-block; padding:3px 10px; border-radius:2px; background:rgba(85,136,59,0.15); color:#2C4A1E; font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; }
  .eb-chip-inact { display:inline-block; padding:3px 10px; border-radius:2px; background:rgba(100,100,100,0.10); color:#666; font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; }
  .eb-prov-info { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; flex:1; }
  .eb-prov-row { display:flex; align-items:center; gap:8px; font-family:'Jost',sans-serif; font-size:0.8rem; color:#55883B; }
  .eb-prov-desc { font-family:'Jost',sans-serif; font-size:0.78rem; color:#2C4A1E; line-height:1.5; margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .eb-prov-footer { display:flex; gap:8px; padding-top:14px; border-top:1px solid rgba(85,136,59,0.12); }
`;

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
    } catch { toast.error('Error al guardar proveedor'); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('Eliminar este proveedor?')) return;
    await adminAPI.eliminarProveedor(id); toast.success('Proveedor eliminado'); cargar();
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#EDF5E4', minHeight:'100vh' }} className="eb-page">
      <style>{MARBLE_STYLES}</style>
      <style>{extraStyles}</style>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1 }}>

        <div className="eb-header">
          <div>
            <p className="eb-subtitle">Elite Beauty — Alianzas</p>
            <h1 className="eb-title">Proveedores</h1>
          </div>
          <button className="eb-btn-primary" onClick={() => handleOpen()}>
            <span style={{ fontSize:'1.1rem', lineHeight:1 }}>+</span> Nuevo Proveedor
          </button>
        </div>

        <div className="eb-content">
          <p className="eb-section-label">{proveedores.length} proveedor(es) registrado(s)</p>
          <p className="eb-hint">Gestiona las empresas y marcas que surten tus productos.</p>

          <div className="eb-grid">
            {proveedores.length === 0 && (
              <div className="eb-empty" style={{ gridColumn:'1/-1' }}>
                <div className="eb-empty-icon">◈</div>
                <div className="eb-empty-title">Sin proveedores aun</div>
                <div className="eb-empty-sub"><span className="eb-ornament" />Agrega el primero<span className="eb-ornament" /></div>
              </div>
            )}
            {proveedores.map(p => (
              <div className="eb-prov-card eb-card-wrap" key={p.id}>
                {p.logoPath
                  ? <img className="eb-prov-logo" src={`${BASE}${p.logoPath}`} alt={p.nombre} />
                  : <div className="eb-prov-avatar">{p.nombre?.charAt(0).toUpperCase()}</div>
                }
                <div className="eb-prov-body">
                  <div className="eb-prov-top">
                    <span className="eb-prov-name">{p.nombre}</span>
                    <span className={p.activo ? 'eb-chip-act' : 'eb-chip-inact'}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <div className="eb-prov-info">
                    {p.empresa   && <div className="eb-prov-row"><span>◈</span>{p.empresa}</div>}
                    {p.telefono  && <div className="eb-prov-row"><span>✆</span>{p.telefono}</div>}
                    {p.correo    && <div className="eb-prov-row"><span>@</span>{p.correo}</div>}
                    {p.descripcion && <p className="eb-prov-desc">{p.descripcion}</p>}
                  </div>
                  <div className="eb-prov-footer">
                    <button className="eb-btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={() => handleOpen(p)}>✎ Editar</button>
                    <button className="eb-btn-danger" onClick={() => handleEliminar(p.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth className="eb-dialog">
          <DialogTitle className="eb-dialog-title">{editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          <DialogContent className="eb-dialog-content">
            <TextField className="eb-field" label="Nombre *" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} fullWidth />
            <TextField className="eb-field" label="Empresa / Marca" value={form.empresa} onChange={e => setForm({...form, empresa:e.target.value})} fullWidth />
            <TextField className="eb-field" label="Telefono" value={form.telefono} onChange={e => setForm({...form, telefono:e.target.value})} fullWidth />
            <TextField className="eb-field" label="Correo" value={form.correo} onChange={e => setForm({...form, correo:e.target.value})} fullWidth />
            <TextField className="eb-field" label="Descripcion" value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} fullWidth multiline rows={3} />
            <FormControlLabel
              control={<Switch checked={form.activo} onChange={e => setForm({...form, activo:e.target.checked})}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked':{ color:'#55883B' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':{ bgcolor:'#C1E899' } }} />}
              label={<span style={{ fontFamily:'Jost,sans-serif', fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#2C4A1E' }}>Proveedor activo</span>}
            />
            <button className="eb-btn-secondary" style={{ position:'relative', overflow:'hidden', width:'100%', justifyContent:'center', padding:'14px' }}>
              ↑ Subir logo
              <input style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} />
            </button>
            {logo && <p style={{ fontFamily:'Jost,sans-serif', fontSize:'0.75rem', color:'#55883B', margin:0 }}>✓ {logo.name}</p>}
          </DialogContent>
          <DialogActions className="eb-dialog-actions">
            <button className="eb-btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="eb-btn-primary" onClick={handleGuardar}>Guardar</button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
}