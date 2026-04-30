import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Client pages
import Menu from './pages/Menu'
import Carrito from './pages/Carrito'
import Pago from './pages/Pago'
import Perfil from './pages/Perfil'
import Pedidos from './pages/Pedidos'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import Inventario from './pages/Inventario'
import GestionarProductos from './pages/GestionarProductos'
import Reportes from './pages/Reportes'

// Kitchen
import Cocina from './pages/Cocina'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Client */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/carrito" element={
          <ProtectedRoute allowedRoles={['Cliente']}>
            <Carrito />
          </ProtectedRoute>
        } />
        <Route path="/pago" element={
          <ProtectedRoute allowedRoles={['Cliente']}>
            <Pago />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute allowedRoles={['Cliente']}>
            <Perfil />
          </ProtectedRoute>
        } />
        <Route path="/pedidos" element={
          <ProtectedRoute allowedRoles={['Cliente']}>
            <Pedidos />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventario" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Inventario />
          </ProtectedRoute>
        } />
        <Route path="/admin/productos" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <GestionarProductos />
          </ProtectedRoute>
        } />
        <Route path="/admin/reportes" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Reportes />
          </ProtectedRoute>
        } />

        {/* Kitchen */}
        <Route path="/cocina" element={
          <ProtectedRoute allowedRoles={['Admin', 'Empleado']}>
            <Cocina />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App

