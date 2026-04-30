import { useEffect, useState } from 'react';
import { getVentasDiarias, getVentasSemana, getProductosMasVendidos, getClientesRegistrados } from '../services/reporteService';
import Sidebar from '../components/Sidebar';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function Reportes() {
  const [ventasDia, setVentasDia] = useState({ total: 0, pedidos: 0 });
  const [ventasSemana, setVentasSemana] = useState([]);
  const [masVendidos, setMasVendidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getVentasDiarias(), getVentasSemana(), getProductosMasVendidos(), getClientesRegistrados()]).then(([vd, vs, mv, cl]) => {
      setVentasDia(vd); setVentasSemana(vs); setMasVendidos(mv); setClientes(cl);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const maxVentas = Math.max(...ventasSemana.map((v) => v.total), 1);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', background: 'var(--bone)' }}>
        <div className='container' style={{ padding: '40px' }}>
          <h1 style={{ marginBottom: '8px' }}>Reportes</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>Analisis de ventas y rendimiento</p>
          {loading ? (<div className='grid-4'>{[1,2,3,4].map((i) => <div key={i} className='card loading' style={{ height: '140px' }} />)}</div>) : (
            <div className='grid-4' style={{ marginBottom: '40px' }}>
              <div className='card' style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={20} style={{ color: '#166534' }} /></div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Ventas hoy</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800 }}>${ventasDia.total.toFixed(2)}</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{ventasDia.pedidos} pedidos</p>
              </div>
              <div className='card' style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={20} style={{ color: '#1E40AF' }} /></div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Semana</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800 }}>${ventasSemana.reduce((a, v) => a + v.total, 0).toFixed(2)}</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{ventasSemana.reduce((a, v) => a + v.pedidos, 0)} pedidos</p>
              </div>
              <div className='card' style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} style={{ color: '#92400E' }} /></div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Top producto</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{masVendidos[0]?.nombre || 'N/A'}</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{masVendidos[0]?.cantidadVendida || 0} vendidos</p>
              </div>
              <div className='card' style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} style={{ color: '#7E22CE' }} /></div>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Clientes</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{clientes.length}</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>registrados</p>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className='card' style={{ padding: '28px' }}>
              <h3 style={{ marginBottom: '20px' }}>Ventas de la semana</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
                {ventasSemana.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '100%', background: 'var(--terracotta)', borderRadius: '6px 6px 0 0', height: Math.max((v.total / maxVentas) * 180, 4) + 'px', transition: 'height 0.3s ease' }} />
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(v.fecha).getDate()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='card' style={{ padding: '28px' }}>
              <h3 style={{ marginBottom: '20px' }}>Mas vendidos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {masVendidos.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: i < 3 ? 'var(--terracotta)' : 'var(--sand)', color: i < 3 ? 'var(--white)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{i + 1}</span>
                      <span style={{ fontSize: '14px' }}>{p.nombre}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>{p.cantidadVendida}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}