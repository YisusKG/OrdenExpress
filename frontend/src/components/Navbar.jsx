import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Menu as MenuIcon, X, ChefHat, LayoutDashboard, BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';
import logo from '../../images/Logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isClient, isAdmin, isEmpleado, isKitchen } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideOn = ['/login', '/register'];
  if (hideOn.includes(location.pathname)) return null;

  const linkStyle = {
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'color 0.2s',
    color: 'var(--ink)',
    textDecoration: 'none',
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logo} alt="Pinchos Banderillas" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Pinchos Banderillas</span>
        </div>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-desktop">
          <span style={linkStyle} onClick={() => navigate('/menu')}>Carta</span>
          {isKitchen() && <span style={linkStyle} onClick={() => navigate('/cocina')}><ChefHat size={14} style={{marginRight:4, verticalAlign:'middle'}}/>Cocina</span>}
          {isEmpleado() && <span style={linkStyle} onClick={() => navigate('/empleado')}><BriefcaseBusiness size={14} style={{marginRight:4, verticalAlign:'middle'}}/>Empleado</span>}
          {isAdmin() && <span style={linkStyle} onClick={() => navigate('/admin')}><LayoutDashboard size={14} style={{marginRight:4, verticalAlign:'middle'}}/>Admin</span>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="nav-desktop">
          {isClient() && (
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/carrito')} style={{ position: 'relative' }}>
              <ShoppingCart size={16} />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: 'var(--terracotta)', color: 'white',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          )}

          {user ? (
            <>
              {isClient() && (
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/perfil')}>
                  <User size={16} />
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => { logout(); navigate('/'); }}>
                Salir
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              Acceder
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="nav-mobile" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          padding: '20px 40px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bone)',
        }}>
          <span style={linkStyle} onClick={() => { navigate('/menu'); setMobileOpen(false); }}>Carta</span>
          {isKitchen() && <span style={linkStyle} onClick={() => { navigate('/cocina'); setMobileOpen(false); }}>Cocina</span>}
          {isEmpleado() && <span style={linkStyle} onClick={() => { navigate('/empleado'); setMobileOpen(false); }}>Empleado</span>}
          {isAdmin() && <span style={linkStyle} onClick={() => { navigate('/admin'); setMobileOpen(false); }}>Admin</span>}
          {isClient() && <span style={linkStyle} onClick={() => { navigate('/carrito'); setMobileOpen(false); }}>Carrito ({count})</span>}
          {isClient() && <span style={linkStyle} onClick={() => { navigate('/perfil'); setMobileOpen(false); }}>Perfil</span>}
          {user ? (
            <span style={linkStyle} onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}>Cerrar sesión</span>
          ) : (
            <span style={linkStyle} onClick={() => { navigate('/login'); setMobileOpen(false); }}>Acceder</span>
          )}
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex; }
        .nav-mobile { display: none; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
