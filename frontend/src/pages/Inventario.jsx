import { useEffect, useState } from 'react';
import { getInventario, entradaInventario } from '../services/productoService';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { Plus } from 'lucide-react';

export default function Inventario() {
  const { addToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [entrada, setEntrada] = useState({ id: '', cantidad: 1 });

  useEffect(() => {
    cargar();
  }, []);

  const cargar = () => {
    getInventario()
      .then((data) => setProductos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleEntrada = async () => {
    if (!entrada.id || entrada.cantidad <= 0) {
      addToast('Selecciona producto y cantidad valida', 'error');
      return;
    }
    try {
      await entradaInventario(entrada.id, entrada.cantidad);
      addToast('Entrada registrada', 'success');
      setShowForm(false);
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
            <button className="btn btn-terracotta btn-sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={16} /> Registrar entrada
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Producto</label>
                  <select
                    className="input"
                    value={entrada.id}
                    onChange={(e) => setEntrada({ ...entrada, id: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {productos.map((p) => (
                      <option key={p.iD_Producto} value={p.iD_Producto}>{p.nombre_P}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '140px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Cantidad</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={entrada.cantidad}
                    onChange={(e) => setEntrada({ ...entrada, cantidad: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <button className="btn btn-terracotta" onClick={handleEntrada}>Guardar</button>
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
}

