import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVentasDiarias, getPedidosRecientes } from '../services/reporteService';
import { getInventario } from '../services/productoService';
import Sidebar from '../components/Sidebar';
import { DollarSign, Package, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pedidos: 0 });
  const [recientes, setRecientes] = useState([]);
  const [bajoStock, setBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVentasDiarias(),
      getPedidosRecientes(),
      getInventario(),
    ])
      .then(([ventas, pedidos, inventario]) => {
        setStats(ventas);
        setRecientes(pedidos.slice(0, 5));
        const alertas = inventario.filter((p) => p.cantidad_Disponible < (p.cantidad_Min || 0));
        setBajoStock(alertas.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: color + '15', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
      <p style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{label}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', background: 'var(--bone)' }}>
        <div className="container" style={{ padding: '40px' }}>
          <h1 style={{ marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '32px', fontSize: '14px' }}>Resumen del dia</p>

          {loading ? (
            <div className="grid-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="card loading" style={{ height: '140px' }} />)}
            </div>
          ) : (
            <div className="grid-4" style={{ marginBottom: '40px' }}>
              <StatCard icon={DollarSign} label="Ventas hoy" value={'$' + (stats.total?.toFixed(2) || '0.00')} color="var(--success)" />
              <StatCard icon={ShoppingCart} label="Pedidos hoy" value={stats.pedidos || 0} color="var(--terracotta)" />
              <StatCard icon={Package} label="Productos" value="-" color="#3B82F6" />
              <StatCard icon={AlertTriangle} label="Alertas stock" value={bajoStock.length} color="var(--warning)" />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px' }}>Pedidos recientes</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/reportes')}>
                  Ver todos <ArrowRight size={14} />
                </button>
              </div>

              {recientes.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Sin pedidos recientes</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recientes.map((ped) => (
                    <div key={ped.iD_Pedido} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', borderRadius: '12px', background: 'var(--sand)',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>Pedido #{ped.iD_Pedido}</p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{ped.cliente || 'Cliente'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: '14px' }}>${parseFloat(ped.total).toFixed(2)}</p>
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                          background: ped.estado === 'Entregado' ? '#DCFCE7' : '#FEF3C7',
                          color: ped.estado === 'Entregado' ? '#166534' : '#92400E',
                        }}>
                          {ped.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Stock bajo</h3>
              {bajoStock.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Todo en orden</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bajoStock.map((prod) => (
                    <div key={prod.iD_Producto} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px', borderRadius: '10px', background: '#FEF2F2',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '13px' }}>{prod.nombre_P}</p>
                        <p style={{ fontSize: '11px', color: 'var(--danger)' }}>
                          {prod.cantidad_Disponible} / min {prod.cantidad_Min}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

