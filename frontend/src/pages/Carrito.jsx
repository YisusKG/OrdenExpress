import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Carrito() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <ShoppingBag size={64} style={{ color: 'var(--line)', marginBottom: '24px' }} />
        <h2 style={{ marginBottom: '12px' }}>Tu carrito esta vacio</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Agrega productos desde el menu.</p>
        <button className="btn btn-terracotta" onClick={() => navigate('/menu')}>
          Explorar menu <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ marginBottom: '32px' }}>Carrito</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => (
              <div key={item.iD_Producto} className="card" style={{
                display: 'flex', gap: '20px', padding: '20px', alignItems: 'center',
              }}>
                <img
                  src={item.imagen ? `/images/${item.imagen}` : '/images/placeholder.jpg'}
                  alt={item.nombre_P}
                  onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '4px' }}>{item.nombre_P}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>${parseFloat(item.precio_Venta).toFixed(2)} c/u</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item.iD_Producto, item.cantidad - 1)}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.cantidad}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item.iD_Producto, item.cantidad + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <p style={{ fontWeight: 700 }}>${(item.cantidad * item.precio_Venta).toFixed(2)}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.iD_Producto)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '28px', position: 'sticky', top: '90px' }}>
            <h3 style={{ marginBottom: '20px' }}>Resumen</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>Envio</span>
              <span>Gratis</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '20px' }}>${total.toFixed(2)}</span>
            </div>
            <button className="btn btn-terracotta btn-lg" style={{ width: '100%' }} onClick={() => navigate('/pago')}>
              Proceder al pago <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '12px' }} onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>
  );
}

