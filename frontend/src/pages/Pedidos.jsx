import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPedidosCliente } from '../services/pedidoService';
import { Package, Calendar, DollarSign } from 'lucide-react';

const estadoColors = {
  'Pendiente': '#F59E0B',
  'En Preparación': '#3B82F6',
  'Listo': '#10B981',
  'Entregado': '#059669',
  'Cancelado': '#EF4444',
};

export default function Pedidos() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getPedidosCliente(user.id)
      .then((data) => setPedidos(data))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '32px' }}>Mis pedidos</h1>
        {loading ? (
          <div className="card loading" style={{ height: '300px' }} />
        ) : pedidos.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <Package size={48} style={{ color: 'var(--line)', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Aun no tienes pedidos</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Realiza tu primera orden desde el menu.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pedidos.map((ped) => (
              <div key={ped.iD_Pedido} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '16px' }}>Pedido #{ped.iD_Pedido}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '13px', color: 'var(--muted)' }}>
                      <Calendar size={14} /> {new Date(ped.fecha).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px',
                    background: (estadoColors[ped.estado] || '#999') + '15',
                    color: estadoColors[ped.estado] || '#999',
                  }}>
                    {ped.estado}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{ped.metodo_Pago}</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={18} /> ${parseFloat(ped.total).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

