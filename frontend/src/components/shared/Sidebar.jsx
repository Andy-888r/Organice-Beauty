import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider, Avatar, IconButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_OPEN = 240;
const DRAWER_CLOSED = 64;

export default function Sidebar({ items }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  return (
    <Drawer variant="permanent" sx={{
      width: open ? DRAWER_OPEN : DRAWER_CLOSED, flexShrink: 0, transition: 'width 0.3s ease',
      '& .MuiDrawer-paper': {
        width: open ? DRAWER_OPEN : DRAWER_CLOSED, boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #0a0806 0%, #1a1210 60%, #0a0806 100%)',
        color: 'white', overflowX: 'hidden', transition: 'width 0.3s ease',
        borderRight: '1px solid rgba(160,82,45,0.25)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.40)',
      }
    }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2.5, pb: 1.5, position: 'relative' }}>
        <IconButton onClick={() => setOpen(!open)} size="small" sx={{
          position: 'absolute', top: 8, right: 6,
          color: 'rgba(243,236,227,0.6)', bgcolor: 'rgba(255,255,255,0.07)',
          '&:hover': { bgcolor: 'rgba(160,82,45,0.30)', color: '#F3ECE3' },
          width: 26, height: 26, transition: 'all 0.2s',
        }}>
          {open ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
        </IconButton>

        {open ? (
          <>
            <Box sx={{
              width: 52, height: 52, borderRadius: '12px', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F3ECE3', border: '1px solid rgba(243,236,227,0.20)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.40)', mb: 1,
            }}>
              <img src="/logo_elite_beauty.png" alt="Elite Beauty"
                style={{ width: '88%', height: '88%', objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </Box>
            <Typography sx={{
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
              fontSize: '0.90rem', fontWeight: 600, color: '#F3ECE3',
              letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1, whiteSpace: 'nowrap',
            }}>Elite Beauty</Typography>
          </>
        ) : (
          <Tooltip title="Elite Beauty" placement="right" arrow>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#F3ECE3', border: '1px solid rgba(243,236,227,0.20)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            }}>
              <img src="/logo_elite_beauty.png" alt="EB"
                style={{ width: '88%', height: '88%', objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Usuario */}
      <Box sx={{ px: open ? 2 : 0.5, pb: 1.5 }}>
        <Divider sx={{ borderColor: 'rgba(160,82,45,0.30)', mb: 1.2 }} />
        {open ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(160,82,45,0.40)', width: 30, height: 30, fontSize: '0.78rem', border: '1px solid rgba(212,149,106,0.45)' }}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.80rem', color: '#F3ECE3', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{user?.nombre}</Typography>
              <Typography sx={{ fontSize: '0.66rem', color: 'rgba(243,236,227,0.42)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.rol}</Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={user?.nombre} placement="right" arrow>
              <Avatar sx={{ bgcolor: 'rgba(160,82,45,0.40)', width: 30, height: 30, fontSize: '0.75rem', border: '1px solid rgba(212,149,106,0.45)' }}>
                {user?.nombre?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          </Box>
        )}
        <Divider sx={{ borderColor: 'rgba(160,82,45,0.18)', mt: 1.2 }} />
      </Box>

      {/* Menú */}
      <List sx={{ pt: 0, px: open ? 0.5 : 0, flex: 1 }}>
        {items.map(({ label, icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ display: 'block', mb: 0.2 }}>
              <Tooltip title={!open ? label : ''} placement="right" arrow>
                <ListItemButton selected={isActive} onClick={() => navigate(path)} sx={{
                  minHeight: 40, justifyContent: open ? 'initial' : 'center',
                  px: open ? 1.5 : 1, mx: open ? 0.5 : 0.3, borderRadius: '9px', transition: 'all 0.2s',
                  '&.Mui-selected': { bgcolor: 'rgba(160,82,45,0.28)', borderLeft: '3px solid #D4956A', pl: open ? 1.2 : 0.8 },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(160,82,45,0.38)' },
                  '&:hover': { bgcolor: 'rgba(243,236,227,0.07)' },
                }}>
                  <ListItemIcon sx={{ color: isActive ? '#D4956A' : 'rgba(243,236,227,0.55)', minWidth: 0, mr: open ? 1.5 : 'auto', justifyContent: 'center', transition: 'color 0.2s' }}>
                    {icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={label} primaryTypographyProps={{
                    fontSize: 13.5, whiteSpace: 'nowrap',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F3ECE3' : 'rgba(243,236,227,0.72)',
                    fontFamily: 'Georgia, serif', letterSpacing: '0.02em',
                  }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Cerrar sesión */}
      <Box sx={{ px: open ? 1 : 0.3, pb: 2, pt: 0.5 }}>
        <Divider sx={{ borderColor: 'rgba(160,82,45,0.22)', mb: 1 }} />
        <Tooltip title={!open ? 'Cerrar sesión' : ''} placement="right" arrow>
          <ListItemButton onClick={logout} sx={{
            borderRadius: '9px', justifyContent: open ? 'initial' : 'center',
            px: open ? 1.5 : 1, py: 0.8, transition: 'all 0.2s',
            '&:hover': { bgcolor: 'rgba(160,82,45,0.22)' }
          }}>
            <ListItemIcon sx={{ color: 'rgba(243,236,227,0.38)', minWidth: 0, mr: open ? 1.5 : 'auto', justifyContent: 'center' }}>✕</ListItemIcon>
            {open && <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 13, color: 'rgba(243,236,227,0.48)', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}




































