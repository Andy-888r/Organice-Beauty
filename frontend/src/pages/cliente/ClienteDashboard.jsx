import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { ShoppingCart, History, Person, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { productosAPI, bannersAPI } from '../../services/api';
import { MARBLE_STYLES } from '../../styles/marble';

const MENU = [
  { label:'Inicio',    icon:<ShoppingCart />, path:'/cliente' },
  { label:'Comprar',   icon:<ShoppingCart />, path:'/cliente/compras' },
  { label:'Historial', icon:<History />,      path:'/cliente/historial' },
  { label:'Mi Perfil', icon:<Person />,       path:'/cliente/perfil' },
];
const BASE = 'http://localhost:8080/api';

const extraStyles = `
  .eb-carousel { position:relative; border-radius:2px; overflow:hidden; height:380px; margin-bottom:48px; }
  .eb-carousel img { width:100%; height:100%; object-fit:cover; display:block; }
  .eb-carousel-gradient { position:absolute; bottom:0; left:0; right:0; height:55%; background:linear-gradient(transparent, rgba(20,40,12,0.80)); }
  .eb-carousel-text { position:absolute; bottom:32px; left:36px; color:#E6F0DC; }
  .eb-carousel-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:600; line-height:1.1; margin-bottom:6px; text-shadow:0 2px 12px rgba(0,0,0,0.5); }
  .eb-carousel-desc { font-family:'Jost',sans-serif; font-size:0.82rem; letter-spacing:0.08em; color:rgba(230,240,220,0.85); }
  .eb-carousel-btn { position:absolute; top:50%; transform:translateY(-50%); width:40px; height:40px; border-radius:2px; background:rgba(44,74,30,0.35); border:1px solid rgba(193,232,153,0.30); color:#E6F0DC; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; backdrop-filter:blur(4px); }
  .eb-carousel-btn:hover { background:rgba(44,74,30,0.60); }
  .eb-carousel-btn.prev { left:16px; }
  .eb-carousel-btn.next { right:16px; }
  .eb-carousel-dots { position:absolute; bottom:16px; right:24px; display:flex; gap:6px; }
  .eb-carousel-dot { height:6px; border-radius:3px; cursor:pointer; transition:all 0.3s; background:rgba(230,240,220,0.45); }
  .eb-carousel-dot.active { width:20px; background:#C1E899; }
  .eb-carousel-dot:not(.active) { width:6px; }
  .eb-carousel-empty { height:300px; border-radius:2px; margin-bottom:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(230,240,220,0.40); border:1px dashed rgba(85,136,59,0.30); }
  .eb-section-header { display:flex; align-items:baseline; gap:16px; margin-bottom:24px; }
  .eb-section-title { font-family:'Cormorant Garamond',serif; font-size:1.6rem; font-weight:600; color:#2C4A1E; }
  .eb-section-badge { font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#55883B; background:rgba(85,136,59,0.12); padding:3px 10px; border-radius:2px; }
  .eb-section-line { flex:1; height:1px; background:rgba(85,136,59,0.15); }
  .eb-products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px; }
  .eb-product-card { border-radius:2px; overflow:hidden; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; }
  .eb-product-card:hover { transform:translateY(-4px); box-shadow:0 10px 32px rgba(44,74,30,0.16); }
  .eb-product-img { width:100%; height:180px; object-fit:cover; display:block; }
  .eb-product-placeholder { width:100%; height:180px; background:rgba(85,136,59,0.10); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color:#55883B; }
  .eb-product-body { padding:16px 18px; background:rgba(248,252,244,0.90); }
  .eb-product-name { font-family:'Jost',sans-serif; font-size:0.9rem; font-weight:500; color:#2C4A1E; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .eb-product-meta { font-family:'Jost',sans-serif; font-size:0.72rem; color:#55883B; letter-spacing:0.06em; margin-bottom:10px; }
  .eb-product-price { font-family:'Cormorant Garamond',serif; font-size:1.3rem; font-weight:600; color:#9A6735; }
`;

export default function ClienteDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [banners, setBanners]     = useState([]);
  const [productos, setProductos] = useState([]);
  const [slide, setSlide]         = useState(0);

  useEffect(() => {
    bannersAPI.listarActivos().then(r => setBanners(r.data)).catch(() => {});
    productosAPI.listarActivos().then(r => setProductos(r.data)).catch(() => {});
  }, []);

  const nuevos   = [...productos].reverse().slice(0, 8);
  const anterior = () => setSlide(s => (s - 1 + banners.length) % banners.length);
  const siguiente= () => setSlide(s => (s + 1) % banners.length);

  useEffect(() => {
    if (banners.length === 0) return;
    const t = setInterval(siguiente, 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[slide];

  return (
    <Box sx={{ display:'flex', bgcolor:'#EDF5E4', minHeight:'100vh' }} className="eb-page">
      <style>{MARBLE_STYLES}</style>
      <style>{extraStyles}</style>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1 }}>

        <div className="eb-header">
          <div>
            <p className="eb-subtitle">Elite Beauty — Bienvenida</p>
            <h1 className="eb-title">Hola, {user?.nombre}</h1>
          </div>
        </div>

        <div className="eb-content">
          {banners.length > 0 ? (
            <div className="eb-carousel">
              <img src={`${BASE}${b.imagenPath}`} alt={b.titulo} />
              <div className="eb-carousel-gradient" />
              <div className="eb-carousel-text">
                {b.titulo     && <div className="eb-carousel-title">{b.titulo}</div>}
                {b.descripcion && <div className="eb-carousel-desc">{b.descripcion}</div>}
              </div>
              {banners.length > 1 && (
                <>
                  <button className="eb-carousel-btn prev" onClick={anterior}><ChevronLeft /></button>
                  <button className="eb-carousel-btn next" onClick={siguiente}><ChevronRight /></button>
                  <div className="eb-carousel-dots">
                    {banners.map((_, i) => (
                      <div key={i} className={`eb-carousel-dot ${i===slide?'active':''}`} onClick={() => setSlide(i)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="eb-carousel-empty">
              <div style={{ fontSize:'2.5rem', marginBottom:12, color:'#55883B' }}>◈</div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', fontWeight:600, color:'#55883B' }}>Elite Beauty</div>
              <div style={{ fontFamily:'Jost,sans-serif', fontSize:'0.7rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'#9A6735', marginTop:4 }}>Proximamente nuevas colecciones</div>
            </div>
          )}

          {nuevos.length > 0 && (
            <>
              <div className="eb-section-header">
                <span className="eb-section-title">Nuevos productos</span>
                <span className="eb-section-badge">Recien agregados</span>
                <div className="eb-section-line" />
              </div>
              <div className="eb-products-grid">
                {nuevos.map(p => (
                  <div className="eb-product-card eb-card-wrap" key={p.id} onClick={() => navigate('/cliente/compras')}>
                    {p.imagenPath
                      ? <img className="eb-product-img" src={`${BASE}${p.imagenPath}`} alt={p.nombre} />
                      : <div className="eb-product-placeholder">◈</div>
                    }
                    <div className="eb-product-body">
                      <div className="eb-product-name">{p.nombre}</div>
                      <div className="eb-product-meta">{p.marca} · {p.categoria}</div>
                      <div className="eb-product-price">${p.precio?.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Box>
    </Box>
  );
}