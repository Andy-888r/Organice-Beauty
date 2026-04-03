import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { ShoppingCart, History, Person } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { clienteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MARBLE_STYLES } from '../../styles/marble';

const MENU = [
  { label:'Inicio',    icon:<ShoppingCart />, path:'/cliente' },
  { label:'Comprar',   icon:<ShoppingCart />, path:'/cliente/compras' },
  { label:'Historial', icon:<History />,      path:'/cliente/historial' },
  { label:'Mi Perfil', icon:<Person />,       path:'/cliente/perfil' },
];

const PREFERENCIAS = ['Maquillaje','Cuidado de piel','Cabello','Fragancias','Unas','Tratamientos faciales'];
const CAMPOS = [
  ['nombreCompleto','Nombre completo','text'],
  ['telefono','Telefono','text'],
  ['correo','Correo','email'],
  ['direccion','Direccion','text'],
];

const extraStyles = `
  .eb-card { max-width:540px; border-radius:2px; padding:36px 40px; }
  .eb-card-section { font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:500; letter-spacing:0.24em; text-transform:uppercase; color:#55883B; margin-bottom:20px; }
  .eb-field-wrap { margin-bottom:16px; }
  .eb-field-label { font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:500; letter-spacing:0.18em; text-transform:uppercase; color:#55883B; display:block; margin-bottom:6px; }
  .eb-field-input { width:100%; background:rgba(230,240,220,0.50); border:1px solid rgba(85,136,59,0.22); border-radius:2px; padding:12px 16px; color:#2C4A1E; font-family:'Jost',sans-serif; font-size:0.9rem; outline:none; transition:border-color 0.2s; }
  .eb-field-input:hover { border-color:rgba(85,136,59,0.45); }
  .eb-field-input:focus { border-color:#55883B; box-shadow:0 0 0 3px rgba(85,136,59,0.08); }
  .eb-divider { height:1px; background:rgba(85,136,59,0.12); margin:28px 0; }
  .eb-prefs-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .eb-pref-item { display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px 14px; border-radius:2px; border:1px solid rgba(85,136,59,0.18); transition:all 0.2s; background:rgba(240,247,234,0.60); }
  .eb-pref-item:hover { border-color:rgba(85,136,59,0.40); }
  .eb-pref-item.checked { border-color:#55883B; background:rgba(85,136,59,0.10); }
  .eb-pref-box { width:16px; height:16px; border-radius:2px; border:1px solid rgba(85,136,59,0.40); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
  .eb-pref-item.checked .eb-pref-box { background:#55883B; border-color:#55883B; }
  .eb-pref-label { font-family:'Jost',sans-serif; font-size:0.80rem; color:#2C4A1E; }
  .eb-btn-save { margin-top:28px; padding:13px 32px; background:linear-gradient(135deg,#2C4A1E,#55883B); color:#F4F9F0; border:none; border-radius:2px; cursor:pointer; font-family:'Jost',sans-serif; font-size:0.68rem; font-weight:500; letter-spacing:0.20em; text-transform:uppercase; transition:all 0.2s; box-shadow:0 2px 12px rgba(85,136,59,0.25); }
  .eb-btn-save:hover { box-shadow:0 4px 20px rgba(85,136,59,0.40); transform:translateY(-1px); }
`;

export default function ClientePerfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nombreCompleto:'', telefono:'', correo:'', direccion:'', preferencias:[] });

  useEffect(() => {
    clienteAPI.perfil(user.id).then(r => {
      const d = r.data;
      setForm({ ...d, preferencias: Array.isArray(d.preferencias) ? d.preferencias : (d.preferencias ? d.preferencias.split(',') : []) });
    });
  }, [user.id]);

  const togglePref = (op) => {
    const arr = form.preferencias.includes(op) ? form.preferencias.filter(p => p !== op) : [...form.preferencias, op];
    setForm({ ...form, preferencias: arr });
  };

  const guardar = async () => {
    try { await clienteAPI.actualizar(user.id, form); toast.success('Perfil actualizado'); }
    catch { toast.error('Error al actualizar'); }
  };

  return (
    <Box sx={{ display:'flex', bgcolor:'#EDF5E4', minHeight:'100vh' }} className="eb-page">
      <style>{MARBLE_STYLES}</style>
      <style>{extraStyles}</style>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1 }}>

        <div className="eb-header">
          <div>
            <p className="eb-subtitle">Elite Beauty — Cuenta</p>
            <h1 className="eb-title">Mi Perfil</h1>
          </div>
        </div>

        <div className="eb-content">
          <div className="eb-card eb-card-wrap">
            <p className="eb-card-section">Informacion personal</p>
            {CAMPOS.map(([name, label, type]) => (
              <div className="eb-field-wrap" key={name}>
                <label className="eb-field-label">{label}</label>
                <input className="eb-field-input" type={type} value={form[name] || ''} onChange={e => setForm({...form, [name]: e.target.value})} />
              </div>
            ))}
            <div className="eb-divider" />
            <p className="eb-card-section">Preferencias</p>
            <div className="eb-prefs-grid">
              {PREFERENCIAS.map(op => (
                <div key={op} className={`eb-pref-item ${form.preferencias?.includes(op) ? 'checked' : ''}`} onClick={() => togglePref(op)}>
                  <div className="eb-pref-box">
                    {form.preferencias?.includes(op) && <span style={{ color:'#F4F9F0', fontSize:10, lineHeight:1 }}>✓</span>}
                  </div>
                  <span className="eb-pref-label">{op}</span>
                </div>
              ))}
            </div>
            <button className="eb-btn-save" onClick={guardar}>Guardar cambios</button>
          </div>
        </div>
      </Box>
    </Box>
  );
}