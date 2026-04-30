import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { crearPedido } from '../services/pedidoService';
import { useToast } from '../components/Toast';
import { CreditCard, Banknote, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Pago() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [metodo, setMetodo] = useState('Efectivo');
  const [procesando, setProcesando] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Tu carrito esta vacio</h2>
        <button className="btn btn-terracotta" onClick={() => navigate('/menu')} style={{ marginTop: '20px' }}>
          Volver al menu
        </button>
      </div>
    );
  }

  const confirmar = async () => {
    if (!user?.id) { addToast('Debes iniciar sesion', 'error'); navigate('/login'); return; }
    setProcesando(true);
    try {
      const productos = items.map((it) => ({ ID_Producto: it.iD_Producto, Cantidad: it.cantidad, Precio_Unitario: it.precio_Venta }));
      await crearPedido({ ID_Cliente: user.id, Metodo_Pago: metodo, Total: total, Productos: productos });
      addToast('Pago realizado con exito', 'success'); clear(); navigate('/pedidos');
    } catch { addToast('Error al procesar el pago', 'error'); }
    finally { setProcesando(false); }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/carrito')} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Volver al carrito
        </button>
        <h1 style={{ marginBottom: '32px' }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '900px' }}>
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Metodo de pago</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ id: 'Efectivo', icon: Banknote, label: 'Efectivo' }, { id: 'Tarjeta', icon: CreditCard, label: 'Tarjeta de credito' }].map((m) => {
                const Icon = m.icon; const active = metodo === m.id;
                return (
                  <button key={m.id} onClick={() => setMetodo(m.id)} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: active ? '2px solid var(--terracotta)' : '2px solid transparent', background: active ? 'var(--sand)' : 'var(--white)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: active ? 'var(--terracotta)' : 'var(--sand)', color: active ? 'var(--white)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600 }}>{m.label}</p>
                      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{m.id === 'Efectivo' ? 'Paga al recibir' : 'Pago seguro en linea'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '13px' }}>
              <ShieldCheck size={16} /> Transaccion segura
            </div>
          </div>
          <div className="card" style={{ padding: '28px', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '20px' }}>Resumen del pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {items.map((item) => (
                <div key={item.iD_Producto} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>{item.cantidad}x {item.nombre_P}</span>
                  <span style={{ fontWeight: 600 }}>${(item.cantidad * item.precio_Venta).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '20px' }}>${total.toFixed(2)}</span>
            </div>
            <button className="btn btn-terracotta btn-lg" style={{ width: '100%', marginTop: '24px' }} onClick={confirmar} disabled={procesando}>
              {procesando ? 'Procesando...' : 'Confirmar pago'}
            </button>
          </div>
        </div>
      </div>
  );
}

