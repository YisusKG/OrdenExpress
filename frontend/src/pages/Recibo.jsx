import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Printer, ArrowLeft } from 'lucide-react';
import { getReciboPedido } from '../services/pedidoService';
import { confirmarSesionStripe } from '../services/stripeService';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function Recibo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { addToast } = useToast();
  const initialRecibo = location.state?.recibo || null;
  const [recibo, setRecibo] = useState(initialRecibo);
  const [loading, setLoading] = useState(!initialRecibo);
  const confirmedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const pendingReceipt = localStorage.getItem('pendingReceipt');

    if (sessionId && !confirmedRef.current) {
      confirmedRef.current = true;
      confirmarSesionStripe(sessionId)
        .then((data) => {
          setRecibo(data.recibo);
          localStorage.removeItem('pendingReceipt');
          clearCart();
          addToast('Pago confirmado', 'success');
        })
        .catch(() => {
          if (pendingReceipt) setRecibo(JSON.parse(pendingReceipt));
          addToast('No se pudo confirmar el pago automaticamente', 'error');
        })
        .finally(() => setLoading(false));
      return;
    }

    if (initialRecibo) {
      return;
    }

    getReciboPedido(id)
      .then((data) => setRecibo(data))
      .catch(() => addToast('No se pudo cargar el recibo', 'error'))
      .finally(() => setLoading(false));
  }, [id, initialRecibo, location.search]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', maxWidth: '760px' }}>
        <div className="card loading" style={{ height: '420px' }} />
      </div>
    );
  }

  if (!recibo) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>No se encontro el recibo</h2>
        <button className="btn btn-terracotta" onClick={() => navigate('/pedidos')} style={{ marginTop: '20px' }}>
          Ver mis pedidos
        </button>
      </div>
    );
  }

  const fecha = new Date(recibo.fecha);

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '780px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/menu')} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Volver al menu
      </button>

      <div className="receipt-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'start', marginBottom: '28px' }}>
          <div>
            <p style={{ color: 'var(--terracotta)', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>{recibo.negocio}</p>
            <h1 style={{ fontSize: '34px', marginBottom: '8px' }}>Recibo de pedido</h1>
            <p style={{ fontSize: '14px' }}>Presenta este folio en sucursal para pagar o recoger tu pedido.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <CheckCircle2 size={34} style={{ color: 'var(--success)', marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>{recibo.estado}</p>
          </div>
        </div>

        <div className="receipt-folio">
          <span>Folio</span>
          <strong>{recibo.folio}</strong>
        </div>

        <div className="receipt-meta">
          <div>
            <span>Cliente</span>
            <strong>{recibo.cliente}</strong>
          </div>
          <div>
            <span>Metodo</span>
            <strong>{recibo.metodoPago}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>{fecha.toLocaleDateString('es-MX')}</strong>
          </div>
          <div>
            <span>Hora</span>
            <strong>{fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
        </div>

        <div style={{ marginTop: '28px' }}>
          {recibo.productos.map((item, index) => (
            <div key={`${item.nombre}-${index}`} className="receipt-row">
              <div>
                <strong>{item.cantidad}x {item.nombre}</strong>
                <span>${Number(item.precioUnitario).toFixed(2)} c/u</span>
              </div>
              <strong>${Number(item.total).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="receipt-total">
          <span>Total</span>
          <strong>${Number(recibo.total).toFixed(2)}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', color: 'var(--muted)', fontSize: '13px' }}>
          <Clock size={16} /> Conserva este recibo hasta recoger tu pedido.
        </div>

        <button className="btn btn-primary" onClick={() => window.print()} style={{ width: '100%', marginTop: '28px' }}>
          <Printer size={16} /> Imprimir recibo
        </button>
      </div>
    </div>
  );
}
