import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMenu } from '../services/productoService';
import { ArrowRight, ChefHat, Clock, Star } from 'lucide-react';
import CardProducto from '../components/CardProducto';
import heroImage from '../assets/hero.png';
import { useAuth } from '../context/AuthContext';
import banderilla1 from '../../images/Banderilla1.jpg';
import banderilla2 from '../../images/Baranderilla2.jpg';
import banderilla3 from '../../images/Banderillas3.jpg';
import banderilla4 from '../../images/Banderillas4.jpg';
import papitasImg from '../../images/Papas.jpg';
import nuggetsImg from '../../images/Nuggets.jpg';
import hotdogImg from '../../images/Hotdog.jpg';
import hamburguesaImg from '../../images/Banderillas3.jpg';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAdmin, isKitchen, isEmpleado } = useAuth();
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
      {/* Hero con imagen de banderillas de fondo */}
      <section className="home-hero">
        <img className="home-hero__image" src={banderilla1} alt="Pinchos Banderillas" />
        <div className="home-hero__overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(217,93,57,0.2)', color: 'var(--terracotta)',
              padding: '8px 16px', borderRadius: '30px', fontSize: '13px',
              fontWeight: 600, marginBottom: '24px',
            }}>
              <Star size={14} /> Pinchos Banderillas
            </div>
            <h1 style={{ color: 'var(--white)', marginBottom: '20px', fontSize: 'clamp(40px, 5vw, 64px)' }}>
              Banderillas hechas<br />para disfrutarse
            </h1>
            <p style={{ color: '#bbb', fontSize: '18px', marginBottom: '40px', maxWidth: '480px', lineHeight: 1.6 }}>
              Descubre sabores únicos, realiza pedidos sin esfuerzo y disfruta el sello de Pinchos Banderillas.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-terracotta btn-lg" onClick={() => navigate('/menu')}>
                Ver carta <ArrowRight size={18} />
              </button>
              {user ? (
                <button
                  className="btn btn-outline btn-lg"
                  onClick={() => navigate(isAdmin() ? '/admin' : isKitchen() ? '/cocina' : isEmpleado() ? '/empleado' : '/pedidos')}
                  style={{ borderColor: '#444', color: 'var(--white)' }}
                >
                  Ir a mi panel
                </button>
              ) : (
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')} style={{ borderColor: '#444', color: 'var(--white)' }}>
                  Crear cuenta
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'var(--ink)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ color: 'var(--white)', marginBottom: '12px' }}>Nuestras Banderillas</h2>
            <p style={{ color: '#888', maxWidth: '500px', margin: '0 auto' }}>Tradición y sabor en cada pincho</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {[
              { src: banderilla1, alt: 'Banderilla Clásica' },
              { src: banderilla2, alt: 'Banderilla Especial' },
              { src: banderilla3, alt: 'Banderilla Premium' },
              { src: banderilla4, alt: 'Banderilla Tradicional' },
            ].map((img, i) => (
              <div key={i} style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
              }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 0', background: 'var(--bone)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ marginBottom: '12px' }}>Por qué Pinchos Banderillas?</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto' }}>Todo lo que necesitas para una experiencia de pedidos perfecta.</p>
          </div>
          <div className="grid-3">
            {[
              { icon: ChefHat, title: 'Chef profesional', desc: 'Platillos preparados por expertos con ingredientes frescos.' },
              { icon: Clock, title: 'Entrega rápida', desc: 'Tu pedido listo en el menor tiempo posible.' },
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

      <section style={{ padding: '80px 0', background: 'var(--sand)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ marginBottom: '8px' }}>Variedad que enamora</h2>
            <p style={{ fontSize: '14px' }}>Más opciones para todos los gustos</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              { src: papitasImg, alt: 'Papas a la Francesa', name: 'Papas a la Francesa' },
              { src: nuggetsImg, alt: 'Nuggets Crujientes', name: 'Nuggets Crujientes' },
              { src: hotdogImg, alt: 'Hot Dog Estilo Americano', name: 'Hot Dog Premium' },
            ].map((img, i) => (
              <div key={i} style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bone)',
                border: '1px solid var(--line)',
              }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>{img.name}</p>
                </div>
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
              <p style={{ fontSize: '14px' }}>Nuestros platillos más populares</p>
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

      {/* CTA Final con imagen de fondo */}
      <section style={{
        padding: '120px 0',
        background: 'var(--ink)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${hamburguesaImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            padding: '80px 60px', textAlign: 'center',
            background: 'rgba(15,15,15,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'var(--white)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h2 style={{ color: 'var(--white)', marginBottom: '16px' }}>
              Listo para ordenar?
            </h2>
            <p style={{ color: '#ccc', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Únete a nuestros clientes satisfechos y disfruta la experiencia de Pinchos Banderillas.
            </p>
            <button className="btn btn-terracotta btn-lg" onClick={() => navigate('/menu')}>
              Explorar menú
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}