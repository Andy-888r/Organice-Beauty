import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas comunes
import Login from './pages/Login';
import RegistroCliente from './pages/RegistroCliente';
import RegistroProveedor from './pages/RegistroProveedor';

// Panel Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductos from './pages/admin/AdminProductos';
import AdminClientes from './pages/admin/AdminClientes';
import AdminProveedores from './pages/admin/AdminProveedores';
import AdminInventario from './pages/admin/AdminInventario';
import AdminSolicitudes from './pages/admin/AdminSolicitudes';
import AdminReportes from './pages/admin/AdminReportes';

// Panel Cliente
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import ClienteCompras from './pages/cliente/ClienteCompras';
import ClienteHistorial from './pages/cliente/ClienteHistorial';
import ClientePerfil from './pages/cliente/ClientePerfil';

// Panel Proveedor
import ProveedorDashboard from './pages/proveedor/ProveedorDashboard';
import ProveedorSolicitudes from './pages/proveedor/ProveedorSolicitudes';
import ProveedorProductos from './pages/proveedor/ProveedorProductos';
import ProveedorPerfil from './pages/proveedor/ProveedorPerfil';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.rol.toLowerCase()}`} />} />
      <Route path="/registro/cliente" element={<RegistroCliente />} />
      <Route path="/registro/proveedor" element={<RegistroProveedor />} />

      {/* Rutas Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/productos" element={<ProtectedRoute roles={['ADMIN']}><AdminProductos /></ProtectedRoute>} />
      <Route path="/admin/clientes" element={<ProtectedRoute roles={['ADMIN']}><AdminClientes /></ProtectedRoute>} />
      <Route path="/admin/proveedores" element={<ProtectedRoute roles={['ADMIN']}><AdminProveedores /></ProtectedRoute>} />
      <Route path="/admin/inventario" element={<ProtectedRoute roles={['ADMIN']}><AdminInventario /></ProtectedRoute>} />
      <Route path="/admin/solicitudes" element={<ProtectedRoute roles={['ADMIN']}><AdminSolicitudes /></ProtectedRoute>} />
      <Route path="/admin/reportes" element={<ProtectedRoute roles={['ADMIN']}><AdminReportes /></ProtectedRoute>} />

      {/* Rutas Cliente */}
      <Route path="/cliente" element={<ProtectedRoute roles={['CLIENTE']}><ClienteDashboard /></ProtectedRoute>} />
      <Route path="/cliente/compras" element={<ProtectedRoute roles={['CLIENTE']}><ClienteCompras /></ProtectedRoute>} />
      <Route path="/cliente/historial" element={<ProtectedRoute roles={['CLIENTE']}><ClienteHistorial /></ProtectedRoute>} />
      <Route path="/cliente/perfil" element={<ProtectedRoute roles={['CLIENTE']}><ClientePerfil /></ProtectedRoute>} />

      {/* Rutas Proveedor */}
      <Route path="/proveedor" element={<ProtectedRoute roles={['PROVEEDOR']}><ProveedorDashboard /></ProtectedRoute>} />
      <Route path="/proveedor/solicitudes" element={<ProtectedRoute roles={['PROVEEDOR']}><ProveedorSolicitudes /></ProtectedRoute>} />
      <Route path="/proveedor/productos" element={<ProtectedRoute roles={['PROVEEDOR']}><ProveedorProductos /></ProtectedRoute>} />
      <Route path="/proveedor/perfil" element={<ProtectedRoute roles={['PROVEEDOR']}><ProveedorPerfil /></ProtectedRoute>} />

      {/* Redirect por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}
