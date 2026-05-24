import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import { API_ORIGIN } from '../services/api';

const getImageUrl = (imageName) => {
  if (!imageName) return '/images/Hamburguesa.jpg';
  if (/^https?:\/\//i.test(imageName)) return imageName;
  if (imageName.includes('/')) return imageName;
  return `/images/${imageName}`;
};

const getBackendImageUrl = (imageName) => {
  if (!imageName || /^https?:\/\//i.test(imageName) || imageName.includes('/')) return null;
  return `${API_ORIGIN}/fotos/${imageName}`;
};

export default function CardProducto({ producto }) {
  const { addItem } = useCart();
  const backendImageUrl = getBackendImageUrl(producto.imagen);

  return (
    <div className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={getImageUrl(producto.imagen)}
          alt={producto.nombre_P}
          onError={(event) => {
            if (backendImageUrl && event.currentTarget.src !== backendImageUrl) {
              event.currentTarget.src = backendImageUrl;
              return;
            }
            event.currentTarget.src = '/images/Hamburguesa.jpg';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      <div style={{ padding: '20px' }}>
        <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{producto.nombre_P}</h3>
          <span style={{ fontWeight: 800, color: 'var(--terracotta)' }}>
            ${parseFloat(producto.precio_Venta).toFixed(2)}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.4, minHeight: '38px' }}>
          {producto.descripcion}
        </p>
        <button
          className="btn btn-terracotta btn-sm"
          style={{ width: '100%' }}
          onClick={() => addItem(producto)}
        >
          <Plus size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Agregar
        </button>
      </div>
    </div>
  );
}
