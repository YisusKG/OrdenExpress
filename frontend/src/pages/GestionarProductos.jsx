import { useEffect, useState } from 'react';
import { getProductos, crearProducto, modificarProducto, eliminarProducto } from '../services/productoService';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function GestionarProductos() {
  const { addToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre_P: '', clasificacion: 'Platillo', descripcion: '', cantidad_Disponible: 0, cantidad_Min: 0, cantidad_Max: 0, costo_Base: 0, porcentaje_Gan: 0, precio_Venta: 0 });
  const [imagen, setImagen] = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = () => { getProductos().then((data) => setProductos(data)).catch(() => {}).finally(() => setLoading(false)); };

  const calcularPrecio = (c, pct) => { const costo = parseFloat(c) || 0; const p = parseFloat(pct) || 0; return (costo + costo * p / 100).toFixed(2); };

  const abrirCrear = () => { setEditId(null); setForm({ nombre_P: '', clasificacion: 'Platillo', descripcion: '', cantidad_Disponible: 0, cantidad_Min: 5, cantidad_Max: 100, costo_Base: 0, porcentaje_Gan: 30, precio_Venta: 0 }); setImagen(null); setModal(true); };

  const abrirEditar = (prod) => { setEditId(prod.iD_Producto); setForm({ nombre_P: prod.nombre_P || '', clasificacion: prod.clasificacion || 'Platillo', descripcion: prod.descripcion || '', cantidad_Disponible: prod.cantidad_Disponible || 0, cantidad_Min: prod.cantidad_Min || 0, cantidad_Max: prod.cantidad_Max || 0, costo_Base: prod.costo_Base || 0, porcentaje_Gan: prod.porcentaje_Gan || 0, precio_Venta: prod.precio_Venta || 0 }); setImagen(null); setModal(true); };

  const guardar = async () => {
    try {
      const data = { ...form, precio_Venta: parseFloat(form.precio_Venta) };
      if (editId) { await modificarProducto(editId, data); addToast('Producto actualizado', 'success'); }
      else { await crearProducto(data, imagen); addToast('Producto creado', 'success'); }
      setModal(false); cargar();
    } catch { addToast('Error al guardar', 'error'); }
  };

  const eliminar = async (id) => { if (!confirm('Eliminar producto?')) return; try { await eliminarProducto(id); addToast('Producto eliminado', 'success'); cargar(); } catch { addToast('Error al eliminar', 'error'); } };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', background: 'var(--bone)' }}>
        <div className='container' style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div><h1 style={{ marginBottom: '4px' }}>Productos</h1><p style={{ color: 'var(--muted)', fontSize: '14px' }}>Gestion del catalogo</p></div>
            <button className='btn btn-terracotta btn-sm' onClick={abrirCrear}><Plus size={16} /> Nuevo producto</button>
          </div>
          {loading ? (<div className='card loading' style={{ height: '300px' }} />) : (
            <div className='table-card'>
              <table className='table'>
                <thead><tr><th>Nombre</th><th>Clasificacion</th><th>Precio</th><th>Stock</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.iD_Producto}>
                      <td style={{ fontWeight: 600 }}>{prod.nombre_P}</td>
                      <td>{prod.clasificacion}</td>
                      <td style={{ fontWeight: 700, color: '#e76f51' }}>
                        ${parseFloat(prod.precio_Venta).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${prod.cantidad_Disponible < 20 ? 'low' : 'ok'}`}>
                          {prod.cantidad_Disponible}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className='icon-btn edit' onClick={() => abrirEditar(prod)} title='Editar'>
                            <Pencil size={16} />
                          </button>
                          <button className='icon-btn delete' onClick={() => eliminar(prod.iD_Producto)} title='Eliminar'>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {modal && (
        <div className='modal-backdrop'>
          <div className='modal'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px' }}>{editId ? 'Editar' : 'Nuevo'} producto</h3>
              <button className='btn btn-ghost btn-sm' onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className='form-grid'>
              <div className='form-group'><label className='form-label'>Nombre</label><input className='input' value={form.nombre_P} onChange={(e) => setForm({ ...form, nombre_P: e.target.value })} /></div>
              <div className='form-group'><label className='form-label'>Clasificacion</label><select className='input' value={form.clasificacion} onChange={(e) => setForm({ ...form, clasificacion: e.target.value })}><option>Platillo</option><option>Bebida</option><option>Postre</option></select></div>
              <div className='form-group' style={{ gridColumn: '1 / -1' }}><label className='form-label'>Descripcion</label><input className='input' value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div className='form-group'><label className='form-label'>Costo base</label><input className='input' type='number' value={form.costo_Base} onChange={(e) => { const c = e.target.value; setForm({ ...form, costo_Base: c, precio_Venta: calcularPrecio(c, form.porcentaje_Gan) }); }} /></div>
              <div className='form-group'><label className='form-label'>% Ganancia</label><input className='input' type='number' value={form.porcentaje_Gan} onChange={(e) => { const pct = e.target.value; setForm({ ...form, porcentaje_Gan: pct, precio_Venta: calcularPrecio(form.costo_Base, pct) }); }} /></div>
              <div className='form-group'><label className='form-label'>Precio venta</label><input className='input' type='number' value={form.precio_Venta} readOnly /></div>
              <div className='form-group'><label className='form-label'>Cantidad inicial</label><input className='input' type='number' value={form.cantidad_Disponible} onChange={(e) => setForm({ ...form, cantidad_Disponible: e.target.value })} /></div>
              <div className='form-group'><label className='form-label'>Cantidad min</label><input className='input' type='number' value={form.cantidad_Min} onChange={(e) => setForm({ ...form, cantidad_Min: e.target.value })} /></div>
              <div className='form-group'><label className='form-label'>Cantidad max</label><input className='input' type='number' value={form.cantidad_Max} onChange={(e) => setForm({ ...form, cantidad_Max: e.target.value })} /></div>
              {!editId && (<div className='form-group' style={{ gridColumn: '1 / -1' }}><label className='form-label'>Imagen</label><input className='input' type='file' accept='image/*' onChange={(e) => setImagen(e.target.files[0])} /></div>)}
            </div>
            <button className='btn btn-terracotta' style={{ marginTop: '24px', width: '100%' }} onClick={guardar}>{editId ? 'Actualizar' : 'Crear'} producto</button>
          </div>
        </div>
      )}
    </div>
  );
}