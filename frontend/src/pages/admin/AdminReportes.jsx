import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Assessment, Inventory, People, Store, Notifications } from '@mui/icons-material';
import Sidebar from '../../components/shared/Sidebar';
import { inventarioAPI } from '../../services/api';
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

const extraStyles = `
  .eb-summary-row { display:flex; gap:20px; margin-bottom:40px; }
  .eb-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
  .eb-report-card { border-radius:2px; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s; }
  .eb-report-card:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(44,74,30,0.12); }
  .eb-report-bar { height:3px; }
  .eb-report-bar.error   { background:#8B2E2E; }
  .eb-report-bar.warning { background:#9A6735; }
  .eb-report-body { padding:20px 22px; background:rgba(248,252,244,0.85); }
  .eb-report-name { font-family:'Jost',sans-serif; font-size:0.9rem; font-weight:500; color:#2C4A1E; margin-bottom:10px; }
  .eb-report-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
  .eb-report-key { font-family:'Jost',sans-serif; font-size:0.68rem; letter-spacing:0.14em; text-transform:uppercase; color:#55883B; }
  .eb-report-val { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:600; }
  .eb-report-val.error   { color:#8B2E2E; }
  .eb-report-val.warning { color:#9A6735; }
  .eb-estado-badge { display:inline-block; padding:3px 10px; border-radius:2px; font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; }
  .eb-estado-badge.error   { background:rgba(139,46,46,0.12); color:#6B1E1E; }
  .eb-estado-badge.warning { background:rgba(154,103,53,0.15); color:#5C3A1E; }
`;

export default function AdminReportes() {
  const [bajoStock, setBajoStock] = useState([]);

  useEffect(() => {
    inventarioAPI.listar().then(r => {
      setBajoStock(r.data.filter(i => i.estado !== 'OK'));
    });
  }, []);

  const sinStock = bajoStock.filter(i => i.estado === 'SIN STOCK').length;
  const bajo     = bajoStock.filter(i => i.estado === 'BAJO').length;

  return (
    <Box sx={{ display:'flex', bgcolor:'#EDF5E4', minHeight:'100vh' }} className="eb-page">
      <style>{MARBLE_STYLES}</style>
      <style>{extraStyles}</style>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1 }}>

        <div className="eb-header">
          <div>
            <p className="eb-subtitle">Elite Beauty — Analisis</p>
            <h1 className="eb-title">Reportes</h1>
          </div>
          <div style={{ fontFamily:'Jost,sans-serif', fontSize:'0.72rem', letterSpacing:'0.12em', color:'#9A6735', textTransform:'uppercase' }}>
            {new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>

        <div className="eb-content">
          {bajoStock.length > 0 && (
            <>
              <p className="eb-section-label">Resumen de alertas</p>
              <div className="eb-summary-row">
                {sinStock > 0 && <div className="eb-summary-card error"><div><div className="eb-card-num">{sinStock}</div><div className="eb-card-label">Sin stock</div></div><span className="eb-card-icon">⚠</span></div>}
                {bajo > 0     && <div className="eb-summary-card warning"><div><div className="eb-card-num">{bajo}</div><div className="eb-card-label">Stock bajo</div></div><span className="eb-card-icon">↓</span></div>}
                <div className="eb-summary-card neutral"><div><div className="eb-card-num">{bajoStock.length}</div><div className="eb-card-label">Total alertas</div></div><span className="eb-card-icon">◈</span></div>
              </div>
            </>
          )}

          <p className="eb-section-label">Productos que requieren atencion</p>

          {bajoStock.length === 0 ? (
            <div className="eb-empty">
              <div className="eb-empty-icon">✓</div>
              <div className="eb-empty-title">Inventario en orden</div>
              <div className="eb-empty-sub"><span className="eb-ornament" />Todos los productos tienen stock suficiente<span className="eb-ornament" /></div>
            </div>
          ) : (
            <div className="eb-grid">
              {bajoStock.map((i, idx) => {
                const tipo = i.estado === 'SIN STOCK' ? 'error' : 'warning';
                return (
                  <div className="eb-report-card eb-card-wrap" key={idx}>
                    <div className={`eb-report-bar ${tipo}`} />
                    <div className="eb-report-body">
                      <div className="eb-report-name">{i.producto?.nombre}</div>
                      {i.producto?.marca && <div className="eb-report-row"><span className="eb-report-key">Marca</span><span style={{ fontFamily:'Jost,sans-serif', fontSize:'0.82rem', color:'#55883B' }}>{i.producto.marca}</span></div>}
                      <div className="eb-report-row"><span className="eb-report-key">Stock actual</span><span className={`eb-report-val ${tipo}`}>{i.stock}</span></div>
                      <div className="eb-report-row"><span className="eb-report-key">Minimo</span><span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.1rem', color:'#55883B' }}>{i.minimo}</span></div>
                      <div className="eb-report-row" style={{ marginTop:10 }}><span className="eb-report-key">Estado</span><span className={`eb-estado-badge ${tipo}`}>{i.estado}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Box>
    </Box>
  );
}