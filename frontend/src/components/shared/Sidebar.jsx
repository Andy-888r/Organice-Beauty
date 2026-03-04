import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
         Toolbar, Typography, Box, Divider, Avatar, IconButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_OPEN   = 240;
const DRAWER_CLOSED = 64;

export default function Sidebar({ items }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(true);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_OPEN : DRAWER_CLOSED,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_OPEN : DRAWER_CLOSED,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #880e4f 0%, #c2185b 100%)',
          color: 'white',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
        }
      }}
    >
      {/* ── Encabezado con botón de colapsar ── */}
      <Toolbar sx={{ flexDirection: 'column', py: 2, gap: 1, position: 'relative', minHeight: open ? 140 : 80,  mt: 3 }}>

        {/* Botón de abrir/cerrar */}
        <IconButton
          onClick={() => setOpen(!open)}
          size="small"
          sx={{
            position: 'absolute', top: -24, right: -14,
            color: 'white', bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            width: 28, height: 28,
          }}
        >
          {open ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
        </IconButton>

        {/* Avatar siempre visible */}
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: open ? 48 : 36, height: open ? 48 : 36, transition: 'all 0.3s' }}>
          {user?.nombre?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Nombre y rol solo cuando está abierto */}
        {open && (
          <>
            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', whiteSpace: 'nowrap' }}>
              {user?.nombre}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>{user?.rol}</Typography>
          </>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      {/* ── Menú ── */}
      <List sx={{ pt: 1 }}>
        {items.map(({ label, icon, path }) => (
          <ListItem key={path} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={!open ? label : ''} placement="right" arrow>
              <ListItemButton
                selected={location.pathname === path}
                onClick={() => navigate(path)}
                sx={{
                  minHeight: 44,
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 2 : 1.5,
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 0, mr: open ? 1.5 : 'auto', justifyContent: 'center' }}>
                  {icon}
                </ListItemIcon>
                {open && (
                  <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, whiteSpace: 'nowrap' }} />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* ── Cerrar sesión ── */}
      <Box sx={{ mt: 'auto', p: 1 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1 }} />
        <Tooltip title={!open ? 'Cerrar sesión' : ''} placement="right" arrow>
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 1,
              justifyContent: open ? 'initial' : 'center',
              px: open ? 2 : 1.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ListItemText
              primary={open ? 'Cerrar sesión' : '✕'}
              primaryTypographyProps={{ fontSize: 14, color: 'white', textAlign: open ? 'left' : 'center' }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}






