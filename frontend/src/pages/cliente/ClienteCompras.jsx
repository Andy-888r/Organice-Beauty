import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, CardActions,
         Button, TextField, Badge, Drawer, List, ListItem, ListItemText,
         Divider, AppBar, Toolbar, Chip } from '@mui/material';
import { ShoppingCart, History, Person, Add, Remove } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Sidebar from '../../components/shared/Sidebar';
import { productosAPI, clienteAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { label: 'Inicio', icon: <ShoppingCart />, path: '/cliente' },
  { label: 'Comprar', icon: <ShoppingCart />, path: '/cliente/compras' },
  { label: 'Historial', icon: <History />, path: '/cliente/historial' },
  { label: 'Mi Perfil', icon: <Person />, path: '/cliente/perfil' },
];

export default function ClienteCompras() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => { productosAPI.listarActivos().then(r => setProductos(r.data)); }, []);

  const agregarAlCarrito = (p) => {
    setCarrito(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, cantidad: i.cantidad+1} : i);
      return [...prev, {...p, cantidad: 1}];
    });
    toast.success(`${p.nombre} agregado al carrito`);
  };

  const eliminarDelCarrito = (id) => setCarrito(prev => prev.filter(i => i.id !== id));

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const handleComprar = async () => {
    if (carrito.length === 0) { toast.warning('El carrito está vacío'); return; }
    try {
      const req = { idCliente: user.id, items: carrito.map(i => ({ idProducto: i.id, cantidad: i.cantidad, precio: i.precio })) };
      const res = await clienteAPI.comprar(req);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a'); link.href = url; link.download = 'ticket.pdf'; link.click();
      setCarrito([]);
      setDrawerOpen(false);
      toast.success('¡Compra realizada! Se descargó tu ticket.');
    } catch (e) { toast.error('Error al procesar la compra'); }
  };

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar items={MENU} />
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb:3 }}>
          <Toolbar>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow:1 }}>Productos Disponibles</Typography>
            <Badge badgeContent={carrito.length} color="primary">
              <Button variant="outlined" startIcon={<ShoppingCart />} onClick={() => setDrawerOpen(true)}>
                Carrito — ${total.toFixed(2)}
              </Button>
            </Badge>
          </Toolbar>
        </AppBar>

        <Grid container spacing={2}>
          {productos.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card sx={{ height:'100%', display:'flex', flexDirection:'column' }}>
                {p.imagenPath
                 ? <CardMedia component="img" height="160" image={`http://localhost:8080/api${p.imagenPath}`} alt={p.nombre} sx={{ objectFit:'cover' }} />
                  : <Box sx={{ height:160, bgcolor:'#f8bbd9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Typography fontSize={40}>💄</Typography></Box>
                }
                <CardContent sx={{ flexGrow:1 }}>
                  <Typography variant="h6">{p.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.marca} | {p.categoria}</Typography>
                  <Typography variant="h6" color="primary" mt={1}>${p.precio?.toFixed(2)}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" startIcon={<Add />} onClick={() => agregarAlCarrito(p)}>
                    Agregar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width:320, p:2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>🛒 Carrito</Typography>
            <List>
              {carrito.map(item => (
                <ListItem key={item.id} secondaryAction={
                  <Button size="small" color="error" onClick={() => eliminarDelCarrito(item.id)}>✕</Button>}>
                  <ListItemText primary={item.nombre} secondary={`x${item.cantidad} — $${(item.precio * item.cantidad).toFixed(2)}`} />
                </ListItem>
              ))}
            </List>
            {carrito.length > 0 && (
              <>
                <Divider />
                <Typography variant="h6" mt={2} mb={2}>Total: ${total.toFixed(2)}</Typography>
                <Button fullWidth variant="contained" onClick={handleComprar}>Comprar y Descargar Ticket</Button>
              </>
            )}
            {carrito.length === 0 && <Typography color="text.secondary" textAlign="center" mt={4}>El carrito está vacío</Typography>}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
}
