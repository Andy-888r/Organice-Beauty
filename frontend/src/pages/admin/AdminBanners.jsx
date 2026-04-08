import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch } from '@mui/material';
import { Assessment, Inventory, People, Store, Notifications } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { bannersAPI } from '../../services/api';
import { MARBLE_STYLES } from '../../styles/marble';

const MENU = [
  { label:'Inicio',      icon:<Assessment />,    path:'/admin' },
  { label:'Productos',   icon:<Inventory />,     path:'/admin/productos' },
  { label:'Banners',     icon:<Assessment />,    path:'/admin/banners' },
  { label:'Clientes',    icon:<People />,        path:'/admin/clientes' },
  { label:'Proveedores', icon:<Store />,         path:'/admin/proveedores' },
  { label:'Inventario',  icon:<Inventory />,     path:'/admin/inventario' },
  { label:'Reportes',    icon:<Assessment />,    path:'/admin/reportes' },
];

const EMPTY = { titulo:'', descripcion:'', orden:0, activo:true };
const BASE   = 'http://localhost:8080/api';

const extraStyles = `
  .eb-hint { font-family:'Jost',sans-serif; font-size:0.75rem; color:#55883B; letter-spacing:0.06em; margin-bottom:24px; margin-top:-12px; }
  .eb-banners-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
  .eb-banner-card { border-radius:2px; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s; }
  .eb-banner-card:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(44,74,30,0.15); }
  .eb-banner-img { width:100%; height:160px; object-fit:cover; display:block; }
  .eb-banner-placeholder { width:100%; height:160px; background:rgba(85,136,59,0.10); display:flex; align-items:center; justify-content:center; font-size:2rem; color:#55883B; }
  .eb-banner-body { padding:18px 20px; background:rgba(248,252,244,0.90); }
  .eb-banner-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
  .eb-banner-name { font-family:'Cormorant Garamond',serif; font-size:1.15rem; font-weight:600; color:#2C4A1E; }
  .eb-banner-orden { font-family:'Jost',sans-serif; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; color:#9A6735; }
  .eb-banner-desc { font-family:'Jost',sans-serif; font-size:0.82rem; color:#55883B; line-height:1.5; margin-bottom:14px; min-height:36px; }
  .eb-banner-footer { display:flex; justify-content:space-between; align-items:center; }
  .eb-chip-act   { display:inline-block; padding:3px 10px; border-radius:2px; background:rgba(85,136,59,0.15); color:#2C4A1E; font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; }
  .eb-chip-inact { display:inline-block; padding:3px 10px; border-radius:2px; background:rgba(100,100,100,0.10); color:#666; font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; }
  .eb-banner-actions { display:flex; gap:8px; }
`;

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [imagen, setImagen]   = useState(null);
  const [editId, setEditId]   = useState(null);

  const cargar = () => bannersAPI.listarTodos().then(r => setBanners(r.data));
  useEffect(() => { cargar(); }, []);

  const handleOpen = (b = null) => {
    setEditId(b?.id || null);
    setForm(b ? { titulo:b.titulo, descripcion:b.descripcion||'', orden:b.orden, activo:b.activo } : EMPTY);
    setImagen(null); setOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim()) { toast.error('El titulo es obligatorio'); return; }
    const fd = new FormData();
    fd.append('banner', JSON.stringify({ ...form, orden: parseInt(form.orden)||0 }));
    if (imagen) fd.append('imagen', imagen);
    try {
      if (editId) { await bannersAPI.actualizar(editId, fd); toast.success('Banner actualizado'); }
      else { await bannersAPI.crear(fd); toast.success('Banner creado'); }
      setOpen(false); cargar();
    } catch { toast.error('Error al guardar banner'); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('Eliminar este banner?')) return;
    await bannersAPI.eliminar(id); toast.success('Banner eliminado'); cargar();
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#EDF5E4', minHeight:'100vh' }} className="eb-page">
      <style>{MARBLE_STYLES}</style>
      <style>{extraStyles}</style>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1 }}>

        <div className="eb-header">
          <div>
            <p className="eb-subtitle">Elite Beauty — Vitrina</p>
            <h1 className="eb-title">Banners Promocionales</h1>
          </div>
          <button className="eb-btn-primary" onClick={() => handleOpen()}>
            <span style={{ fontSize:'1.1rem', lineHeight:1 }}>+</span> Nuevo Banner
          </button>
        </div>

        <div className="eb-content">
          <p className="eb-section-label">{banners.length} banner(s) — carrusel del inicio</p>
          <p className="eb-hint">Estas imagenes aparecen en el carrusel principal de la tienda.</p>

          {banners.length === 0 ? (
            <div className="eb-empty">
              <div className="eb-empty-icon">🖼</div>
              <div className="eb-empty-title">Sin banners aun</div>
              <div className="eb-empty-sub"><span className="eb-ornament" />Crea el primero<span className="eb-ornament" /></div>
            </div>
          ) : (
            <div className="eb-banners-grid">
              {banners.map(b => (
                <div className="eb-banner-card eb-card-wrap" key={b.id}>
                  {b.imagenPath
                    ? <img className="eb-banner-img" src={`${BASE}${b.imagenPath}`} alt={b.titulo} />
                    : <div className="eb-banner-placeholder">◈</div>
                  }
                  <div className="eb-banner-body">
                    <div className="eb-banner-top">
                      <span className="eb-banner-name">{b.titulo}</span>
                      <span className="eb-banner-orden">#{b.orden}</span>
                    </div>
                    <p className="eb-banner-desc">{b.descripcion || <em style={{ opacity:0.5 }}>Sin descripcion</em>}</p>
                    <div className="eb-banner-footer">
                      <span className={b.activo ? 'eb-chip-act' : 'eb-chip-inact'}>{b.activo ? 'Activo' : 'Inactivo'}</span>
                      <div className="eb-banner-actions">
                        <button className="eb-btn-secondary" onClick={() => handleOpen(b)}>✎ Editar</button>
                        <button className="eb-btn-danger" onClick={() => handleEliminar(b.id)}>✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth className="eb-dialog">
          <DialogTitle className="eb-dialog-title">{editId ? 'Editar Banner' : 'Nuevo Banner'}</DialogTitle>
          <DialogContent className="eb-dialog-content">
            <TextField className="eb-field" label="Titulo *" value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})} fullWidth />
            <TextField className="eb-field" label="Descripcion" value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} fullWidth multiline rows={2} />
            <TextField className="eb-field" label="Orden" type="number" value={form.orden} onChange={e => setForm({...form, orden:e.target.value})} helperText="Menor numero = aparece primero" fullWidth inputProps={{ min:0 }} />
            <FormControlLabel
              control={<Switch checked={form.activo} onChange={e => setForm({...form, activo:e.target.checked})}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked':{ color:'#55883B' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':{ bgcolor:'#C1E899' } }} />}
              label={<span style={{ fontFamily:'Jost,sans-serif', fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#2C4A1E' }}>Visible en la tienda</span>}
            />
            <button className="eb-btn-secondary" style={{ position:'relative', overflow:'hidden', width:'100%', justifyContent:'center', padding:'14px' }}>
              ↑ Subir imagen
              <input style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])} />
            </button>
            {imagen && <p style={{ fontFamily:'Jost,sans-serif', fontSize:'0.75rem', color:'#55883B', margin:0 }}>✓ {imagen.name}</p>}
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