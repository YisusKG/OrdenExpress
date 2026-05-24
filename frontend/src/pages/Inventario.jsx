import { useCallback, useEffect, useState } from 'react';
import { getInventario, entradaInventario } from '../services/productoService';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { Plus, X } from 'lucide-react';

export default function Inventario() {
  const { addToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [entrada, setEntrada] = useState({ id: '', cantidad: 1 });

  const cargar = useCallback(() => {
    getInventario()
      .then((data) => setProductos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleEntrada = async () => {
    if (!entrada.id || entrada.cantidad <= 0) {
      addToast('Selecciona producto y cantidad valida', 'error');
      return;
    }
    try {
      await entradaInventario(entrada.id, entrada.cantidad);
      addToast('Entrada registrada', 'success');
      setModal(false);
      setEntrada({ id: '', cantidad: 1 });
      cargar();
    } catch {
      addToast('Error al registrar entrada', 'error');
    }
  };

  const getAlerta = (p) => {
    if (p.cantidad_Disponible < (p.cantidad_Min || 0)) return 'alerta-min';
    if (p.cantidad_Disponible > (p.cantidad_Max || 99999)) return 'alerta-max';
    return '';
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', background: 'var(--bone)' }}>
        <div className="container" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ marginBottom: '4px' }}>Inventario</h1>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Control de existencias</p>
            </div>
            <button className="btn btn-terracotta btn-sm" onClick={() => setModal(true)}>
              <Plus size={16} /> Registrar entrada
            </button>
          </div>

          {loading ? (
            <div className="card loading" style={{ height: '300px' }} />
          ) : (
            <div className="table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Descripcion</th>
                    <th>Disponible</th>
                    <th>Min</th>
                    <th>Max</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => {
                    const alerta = getAlerta(p);
                    const esBajo = p.cantidad_Disponible < (p.cantidad_Min || 0);
                    return (
                      <tr key={p.iD_Producto}>
                        <td className={alerta}>{p.nombre_P}</td>
                        <td className={alerta}>{p.descripcion}</td>
                        <td>
                          <span className={`badge ${esBajo ? 'low' : 'ok'}`}>
                            {p.cantidad_Disponible}
                          </span>
                        </td>
                        <td>{p.cantidad_Min ?? 'N/A'}</td>
                        <td>{p.cantidad_Max ?? 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modal && (
          <div className="modal-backdrop">
            <div className="modal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px' }}>Registrar entrada</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={18} /></button>
              </div>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Producto</label>
                  <select className="input" value={entrada.id} onChange={(e) => setEntrada({ ...entrada, id: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {productos.map((p) => (
                      <option key={p.iD_Producto} value={p.iD_Producto}>{p.nombre_P}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad</label>
                  <input className="input" type="number" min="1" value={entrada.cantidad} onChange={(e) => setEntrada({ ...entrada, cantidad: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <button className="btn btn-terracotta" style={{ marginTop: '24px', width: '100%' }} onClick={handleEntrada}>Guardar entrada</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
