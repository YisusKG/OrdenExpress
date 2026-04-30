import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMenu } from '../services/productoService';
import { ArrowRight, ChefHat, Clock, Star } from 'lucide-react';
import CardProducto from '../components/CardProducto';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu()
      .then((data) => setFeatured(data.slice(0, 3)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--ink)',
        color: 'var(--white)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(217,93,57,0.2)', color: 'var(--terracotta)',
              padding: '8px 16px', borderRadius: '30px', fontSize: '13px',
              fontWeight: 600, marginBottom: '24px',
            }}>
              <Star size={14} /> Experiencia gastronomica premium
            </div>
            <h1 style={{ color: 'var(--white)', marginBottom: '20px', fontSize: 'clamp(40px, 5vw, 64px)' }}>
              La cocina moderna<br />a tu alcance
            </h1>
            <p style={{ color: '#999', fontSize: '18px', marginBottom: '40px', maxWidth: '480px' }}>
              Descubre sabores unicos, realiza pedidos sin esfuerzo y disfruta de una experiencia culinaria excepcional.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-terracotta btn-lg" onClick={() => navigate('/menu')}>
                Ver carta <ArrowRight size={18} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')} style={{ borderColor: '#444', color: 'var(--white)' }}>
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute', right: '-5%', top: '10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,93,57,0.15) 0%, transparent 70%)',
        }} />
      </section>

      <section style={{ padding: '100px 0', background: 'var(--bone)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ marginBottom: '12px' }}>Por que OrdenExpress?</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto' }}>Todo lo que necesitas para una experiencia de pedidos perfecta.</p>
          </div>
          <div className="grid-3">
            {[
              { icon: ChefHat, title: 'Chef profesional', desc: 'Platillos preparados por expertos con ingredientes frescos.' },
              { icon: Clock, title: 'Entrega rapida', desc: 'Tu pedido listo en el menor tiempo posible.' },
              { icon: Star, title: 'Calidad premium', desc: 'Solo lo mejor para nuestros clientes.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'var(--sand)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <f.icon size={24} style={{ color: 'var(--terracotta)' }} />
                </div>
                <h4 style={{ marginBottom: '10px' }}>{f.title}</h4>
                <p style={{ fontSize: '14px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'var(--sand)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Destacados</h2>
              <p style={{ fontSize: '14px' }}>Nuestros platillos mas populares</p>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('/menu')}>
              Ver todo <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="grid-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card loading" style={{ height: '360px' }} />
              ))}
            </div>
          ) : (
            <div className="grid-3">
              {featured.map((p) => (
                <CardProducto key={p.iD_Producto} producto={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'var(--bone)' }}>
        <div className="container">
          <div className="card" style={{
            padding: '80px 60px', textAlign: 'center',
            background: 'var(--ink)', color: 'var(--white)',
          }}>
            <h2 style={{ color: 'var(--white)', marginBottom: '16px' }}>
              Listo para ordenar?
            </h2>
            <p style={{ color: '#999', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Unete a miles de clientes satisfechos y disfruta de la mejor experiencia gastronomica.
            </p>
            <button className="btn btn-terracotta btn-lg" onClick={() => navigate('/menu')}>
              Explorar menu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

