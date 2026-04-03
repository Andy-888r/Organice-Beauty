import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const CAMPOS = [
  ['usuario',        'Usuario',        'text',     'Tu nombre de usuario'],
  ['contrasena',     'Contrasena',     'password', '••••••••'],
  ['nombreCompleto', 'Nombre completo','text',     'Como aparecera en tu cuenta'],
  ['telefono',       'Telefono',       'text',     'Numero de contacto'],
  ['correo',         'Correo',         'email',    'correo@ejemplo.com'],
  ['direccion',      'Direccion',      'text',     'Tu direccion de entrega'],
];

export default function RegistroCliente() {
  const [form, setForm] = useState({ usuario:'', contrasena:'', nombreCompleto:'', telefono:'', correo:'', direccion:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authAPI.registrarCliente(form);
      login(res.data); navigate('/cliente');
    } catch (err) { setError(err.response?.data || 'Error al registrarse'); }
    finally { setLoading(false); }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
    * { box-sizing: border-box; }
    .eb-reg-bg {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden; padding: 40px 20px;
      background: #E8F2E0;
    }
    .eb-marble {
      position: absolute; inset: 0; z-index: 0;
      background:
        radial-gradient(ellipse 80% 60% at 15% 20%, rgba(85,136,59,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 85% 75%, rgba(85,136,59,0.14) 0%, transparent 55%),
        radial-gradient(ellipse 40% 40% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 50%),
        linear-gradient(135deg, #F0F7EA 0%, #E8F2E0 40%, #EDF5E4 70%, #F2F8EE 100%);
    }
    .eb-marble::before {
      content: '';
      position: absolute; inset: 0;
      background:
        linear-gradient(105deg, transparent 30%, rgba(201,168,76,0.12) 31%, rgba(201,168,76,0.06) 32%, transparent 33%),
        linear-gradient(78deg,  transparent 50%, rgba(201,168,76,0.10) 51%, rgba(201,168,76,0.04) 52%, transparent 53%),
        linear-gradient(125deg, transparent 60%, rgba(201,168,76,0.08) 61%, transparent 62%);
    }
    .eb-reg-card {
      position: relative; z-index: 1; width: 100%; max-width: 460px;
      background: rgba(248,250,246,0.88); backdrop-filter: blur(20px);
      border: 1px solid rgba(201,168,76,0.35);
      box-shadow: 0 20px 60px rgba(44,74,30,0.18), inset 0 1px 0 rgba(255,255,255,0.80);
      border-radius: 4px; padding: 44px 44px 40px;
    }
    .eb-reg-header { text-align: center; margin-bottom: 32px; }
    .eb-reg-logo-box {
      width: 56px; height: 56px; border-radius: 4px; background: #fff;
      margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(44,74,30,0.15);
      border: 1px solid rgba(201,168,76,0.35);
    }
    .eb-reg-brand {
      font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600;
      color: #2C4A1E; letter-spacing: 0.22em; text-transform: uppercase; display: block;
    }
    .eb-reg-divider {
      width: 60px; height: 1px; margin: 10px auto;
      background: linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent);
    }
    .eb-reg-heading {
      font-family: 'Jost', sans-serif; font-size: 0.62rem; font-weight: 500;
      letter-spacing: 0.26em; text-transform: uppercase; color: rgba(44,74,30,0.45);
    }
    .eb-grid-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    .eb-field-full { grid-column: 1 / -1; }
    .eb-field-label {
      font-family: 'Jost', sans-serif; font-size: 0.60rem; font-weight: 500;
      letter-spacing: 0.18em; text-transform: uppercase; color: rgba(44,74,30,0.55);
      display: block; margin-bottom: 5px;
    }
    .eb-field-input {
      width: 100%; background: rgba(230,240,220,0.50);
      border: 1px solid rgba(154,103,53,0.22);
      border-radius: 2px; padding: 11px 14px; color: #2C4A1E;
      font-family: 'Jost', sans-serif; font-size: 0.88rem; outline: none; transition: border-color 0.2s;
    }
    .eb-field-input:hover { border-color: rgba(154,103,53,0.42); }
    .eb-field-input:focus { border-color: rgba(154,103,53,0.65); box-shadow: 0 0 0 3px rgba(154,103,53,0.08); }
    .eb-field-input::placeholder { color: rgba(44,74,30,0.25); }
    .eb-btn-submit {
      width: 100%; margin-top: 24px; padding: 14px;
      background: linear-gradient(135deg, #2C4A1E 0%, #55883B 50%, #9A6735 100%);
      color: #F8FAF6; border: none; border-radius: 2px; cursor: pointer;
      font-family: 'Jost', sans-serif; font-size: 0.68rem; font-weight: 500;
      letter-spacing: 0.24em; text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(85,136,59,0.30); transition: all 0.25s;
    }
    .eb-btn-submit:hover { box-shadow: 0 6px 28px rgba(85,136,59,0.48); transform: translateY(-1px); }
    .eb-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .eb-reg-footer {
      margin-top: 20px; text-align: center;
      font-family: 'Jost', sans-serif; font-size: 0.70rem;
      color: rgba(44,74,30,0.40); letter-spacing: 0.06em;
    }
    .eb-reg-footer a { color: #55883B; font-style: italic; text-decoration: none; }
    .eb-reg-footer a:hover { color: #2C4A1E; }
  `;

  return (
    <div className="eb-reg-bg">
      <style>{styles}</style>
      <div className="eb-marble" />
      <div className="eb-reg-card">
        <div className="eb-reg-header">
          <div className="eb-reg-logo-box">
            <img src="/logo_elite_beauty.png" alt="Elite Beauty"
              style={{ width:'80%', height:'80%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; }} />
          </div>
          <span className="eb-reg-brand">Elite Beauty</span>
          <div className="eb-reg-divider" />
          <span className="eb-reg-heading">Crear cuenta nueva</span>
        </div>
        {error && <Alert severity="error" sx={{ mb:2, borderRadius:'2px', fontSize:'0.8rem' }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <div className="eb-grid-fields">
            {CAMPOS.map(([name, label, type, placeholder]) => (
              <div key={name} className={name === 'direccion' || name === 'nombreCompleto' ? 'eb-field-full' : ''}>
                <label className="eb-field-label">{label}</label>
                <input className="eb-field-input" type={type} placeholder={placeholder}
                  value={form[name]} onChange={e => setForm({...form, [name]: e.target.value})} required />
              </div>
            ))}
          </div>
          <button className="eb-btn-submit" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={18} sx={{ color:'#F8FAF6' }} /> : 'Crear cuenta'}
          </button>
        </form>
        <p className="eb-reg-footer">
          Ya tienes cuenta? <Link to="/login">Inicia sesion aqui</Link>
        </p>
      </div>
    </div>
  );
}