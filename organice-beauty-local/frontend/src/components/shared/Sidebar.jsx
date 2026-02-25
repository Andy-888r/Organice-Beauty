import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
         Toolbar, Typography, Box, Divider, Avatar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;

export default function Sidebar({ items }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer variant="permanent" sx={{
      width: DRAWER_WIDTH, flexShrink: 0,
      '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #880e4f 0%, #c2185b 100%)', color: 'white' }
    }}>
      <Toolbar sx={{ flexDirection: 'column', py: 2, gap: 1 }}>
        <Typography variant="h6" fontWeight="bold">💄 Organice</Typography>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 48, height: 48 }}>
          {user?.nombre?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center' }}>
          {user?.nombre}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>{user?.rol}</Typography>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <List>
        {items.map(({ label, icon, path }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton selected={location.pathname === path}
              onClick={() => navigate(path)}
              sx={{ '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 1 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1 }} />
        <ListItemButton onClick={logout} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 14, color: 'white' }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
