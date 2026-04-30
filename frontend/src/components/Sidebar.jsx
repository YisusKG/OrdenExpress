import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/inventario', icon: Package, label: 'Inventario' },
    { to: '/admin/productos', icon: ClipboardList, label: 'Productos' },
    { to: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  ];

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: '240px', height: '100vh',
      background: 'var(--white)', borderRight: '1px solid var(--line)',
      padding: '24px', zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--terracotta)', color: 'var(--white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700,
        }}>
          OX
        </div>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>Admin</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
                fontWeight: 600, color: isActive ? 'var(--ink)' : 'var(--muted)',
                background: isActive ? 'var(--sand)' : 'transparent',
                textDecoration: 'none',
                transition: '0.15s',
              })}
            >
              <Icon size={18} />
              {l.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
