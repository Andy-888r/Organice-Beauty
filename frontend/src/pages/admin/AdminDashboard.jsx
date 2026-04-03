import React, { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
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

const estadoChipClass = (e) => e === 'SIN STOCK' ? 'eb-chip-sinstock' : e === 'BAJO' ? 'eb-chip-bajo' : 'eb-chip-ok';

const extraStyles = `
  .eb-loading { text-align:center; padding:80px 20px; font-family:'Jost',sans-serif; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; color:#55883B; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .eb-loading { animation:pulse 1.6s ease-in-out infinite; }
  .eb-summary-row { display:flex; gap:20px; margin-bottom:36px; }
  .eb-stock-num { font-family:'Cormorant Garamond',serif; font-size:1.3rem; font-weight:600; }
  .eb-stock-num.ok      { color:#55883B; }
  .eb-stock-num.warning { color:#9A6735; }
  .eb-stock-num.error   { color:#8B2E2E; }
`;

export default function AdminDashboard() {
  const [alertas, setAlertas]   = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    inventarioAPI.listar()
      .then(r => {
        const criticos = r.data.filter(i => i.estado === 'BAJO' || i.estado === 'SIN STOCK');
        criticos.sort((a, b) => {
          if (a.estado === 'SIN STOCK' && b.estado !== 'SIN STOCK') return -1;
          if (b.estado === 'SIN STOCK' && a.estado !== 'SIN STOCK') return 1;
          return 0;
        });
        setAlertas(criticos);
      })
      .finally(() => setCargando(false));
  }, []);

  const sinStock = alertas.filter(i => i.estado === 'SIN STOCK').length;
  const bajo     = alertas.filter(i => i.estado === 'BAJO').length;

  return (
    <Box sx={{ display:'flex', bgcolor:'#EDF5E4', minHeight:'100vh' }} className="eb-page">
      <style>{MARBLE_STYLES}</style>
      <style>{extraStyles}</style>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1 }}>

        <div className="eb-header">
          <div>
            <p className="eb-subtitle">Elite Beauty — Panel</p>
            <h1 className="eb-title">Alertas de Inventario</h1>
          </div>
          <div style={{ fontFamily:'Jost,sans-serif', fontSize:'0.72rem', letterSpacing:'0.12em', color:'#9A6735', textTransform:'uppercase' }}>
            {new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>

        <div className="eb-content">
          {cargando ? (
            <div className="eb-loading">Verificando inventario...</div>
          ) : alertas.length === 0 ? (
            <div className="eb-empty">
              <div className="eb-empty-icon">✓</div>
              <div className="eb-empty-title">Inventario en orden</div>
              <div className="eb-empty-sub">
                <span className="eb-ornament" />
                Todos los productos tienen stock suficiente
                <span className="eb-ornament" />
              </div>
            </div>
          ) : (
            <>
              <div className="eb-summary-row">
                {sinStock > 0 && (
                  <div className="eb-summary-card error">
                    <div>
                      <div className="eb-card-num">{sinStock}</div>
                      <div className="eb-card-label">Sin stock</div>
                    </div>
                    <span className="eb-card-icon">⚠</span>
                  </div>
                )}
                {bajo > 0 && (
                  <div className="eb-summary-card warning">
                    <div>
                      <div className="eb-card-num">{bajo}</div>
                      <div className="eb-card-label">Stock bajo</div>
                    </div>
                    <span className="eb-card-icon">↓</span>
                  </div>
                )}
                <div className="eb-summary-card neutral">
                  <div>
                    <div className="eb-card-num">{alertas.length}</div>
                    <div className="eb-card-label">Total alertas</div>
                  </div>
                  <span className="eb-card-icon">◈</span>
                </div>
              </div>

              <p className="eb-section-label">Productos que requieren atencion</p>
              <div className="eb-table-wrap">
                <table className="eb-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Marca</th>
                      <th>Stock actual</th>
                      <th>Minimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertas.map((i, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight:500 }}>{i.producto?.nombre}</td>
                        <td style={{ color:'#55883B', fontSize:'0.82rem' }}>{i.producto?.marca ?? '—'}</td>
                        <td>
                          <span className={`eb-stock-num ${i.estado === 'SIN STOCK' ? 'error' : 'warning'}`}>
                            {i.stock}
                          </span>
                        </td>
                        <td style={{ color:'#9A6735' }}>{i.minimo}</td>
                        <td>
                          <Chip label={i.estado} size="small" className={estadoChipClass(i.estado)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Box>
    </Box>
  );
}