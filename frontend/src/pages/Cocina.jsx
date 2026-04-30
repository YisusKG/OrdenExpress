import { useEffect, useState } from 'react';
import { getTodosPedidos, cambiarEstadoPedido } from '../services/pedidoService';
import { useToast } from '../components/Toast';
import { Clock, ChefHat, CheckCircle, Truck } from 'lucide-react';

const columnas = [
  { id: 'Pendiente', label: 'Recibido', icon: Clock, color: '#FEF3C7', text: '#92400E' },
  { id: 'En Preparación', label: 'Preparando', icon: ChefHat, color: '#DBEAFE', text: '#1E40AF' },
  { id: 'Listo', label: 'Listo', icon: CheckCircle, color: '#DCFCE7', text: '#166534' },
  { id: 'Entregado', label: 'Entregado', icon: Truck, color: '#F3E8FF', text: '#7C3AED' },
];

export default function Cocina() {
  const { addToast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 10000);
    return () => clearInterval(interval);
  }, []);

  const cargar = () => {
    getTodosPedidos()
      .then((data) => setPedidos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const mover = async (pedido, nuevoEstado) => {
    try {
      await cambiarEstadoPedido(pedido.iD_Pedido, nuevoEstado);
      addToast('Pedido #' + pedido.iD_Pedido + ' -> ' + nuevoEstado, 'success');
      cargar();
    } catch {
      addToast('Error al cambiar estado', 'error');
    }
  };

  const siguienteEstado = (actual) => {
    const idx = columnas.findIndex((c) => c.id === actual);
    return idx >= 0 && idx < columnas.length - 1 ? columnas[idx + 1].id : null;
  };

  return (
    <div className='page' style={{ background: 'var(--ink)', color: 'var(--white)' }}>
      <div className='container' style={{ paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: 'var(--white)', marginBottom: '4px' }}>Kanban Operacional</h1>
            <p style={{ color: '#888', fontSize: '14px' }}>Gestion de pedidos en tiempo real</p>
          </div>
          <button className='btn btn-outline btn-sm' onClick={cargar} style={{ borderColor: '#444', color: '#aaa' }}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[1,2,3,4].map((i) => <div key={i} className='card loading' style={{ height: '400px', background: '#222' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {columnas.map((col) => {
              const colPedidos = pedidos.filter((p) => p.estado === col.id);
              const Icon = col.icon;
              return (
                <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 16px', borderRadius: '12px', background: col.color + '20',
                  }}>
                    <Icon size={18} style={{ color: col.text }} />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: col.text }}>{col.label}</span>
                    <span style={{
                      marginLeft: 'auto', fontSize: '12px', fontWeight: 700,
                      background: col.color, color: col.text, padding: '2px 10px', borderRadius: '20px',
                    }}>
                      {colPedidos.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {colPedidos.length === 0 && (
                      <div style={{
                        padding: '40px 20px', textAlign: 'center', borderRadius: '12px',
                        border: '1px dashed #333', color: '#555', fontSize: '13px',
                      }}>
                        Sin pedidos
                      </div>
                    )}

                    {colPedidos.map((p) => {
                      const next = siguienteEstado(p.estado);
                      const detallesTexto = p.detalles && p.detalles.length > 0
                        ? p.detalles.map((d) => d.cantidad + 'x ' + (d.producto ? d.producto.nombre_P : '')).join(', ')
                        : 'Sin detalles';

                      return (
                        <div key={p.iD_Pedido} style={{
                          background: '#1a1a1a', borderRadius: '16px', padding: '18px',
                          border: '1px solid #2a2a2a',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>#{p.iD_Pedido}</span>
                            <span style={{ fontSize: '12px', color: '#888' }}>
                              {new Date(p.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>
                            {p.cliente && p.cliente.nombre ? p.cliente.nombre : 'Cliente'}
                          </p>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                            {detallesTexto}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>${parseFloat(p.total).toFixed(2)}</span>
                            {next && (
                              <button
                                className='btn btn-sm'
                                onClick={() => mover(p, next)}
                                style={{
                                  background: col.text, color: 'white', borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
                                }}
                              >
                                Avanzar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
