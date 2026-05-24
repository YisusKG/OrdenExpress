import { useEffect, useState, useCallback } from 'react';
import { getClientes, deleteCliente, getEmpleados, crearEmpleado, updateEmpleado, deleteEmpleado } from '../services/usuarioService';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';

export default function GestionarUsuarios() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('clientes');
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido_Paterno: '', apellido_Materno: '', telefono: '', correo_E: '', usuario: '', passwordHash: '', rol_Empleado: 'Empleado' });

  const cargarClientes = useCallback(() => {
    getClientes().then(setClientes).catch(() => {});
  }, []);

  const cargarEmpleados = useCallback(() => {
    getEmpleados().then(setEmpleados).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    if (tab === 'clientes') {
      getClientes().then(setClientes).catch(() => {}).finally(() => setLoading(false));
    } else {
      getEmpleados().then(setEmpleados).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  const eliminarCliente = async (id) => {
    if (!confirm('Eliminar este cliente?')) return;
    try {
      await deleteCliente(id);
      addToast('Cliente eliminado', 'success');
      getClientes().then(setClientes);
    } catch {
      addToast('Error al eliminar cliente', 'error');
    }
  };

  const abrirCrearEmpleado = () => {
    setEditId(null);
    setForm({ nombre: '', apellido_Paterno: '', apellido_Materno: '', telefono: '', correo_E: '', usuario: '', passwordHash: '', rol_Empleado: 'Empleado' });
    setModal(true);
  };

  const abrirEditarEmpleado = (emp) => {
    setEditId(emp.iD_Empleado);
    setForm({
      nombre: emp.nombre || '',
      apellido_Paterno: emp.apellido_Paterno || '',
      apellido_Materno: emp.apellido_Materno || '',
      telefono: emp.telefono || '',
      correo_E: emp.correo_E || '',
      usuario: emp.usuario || '',
      passwordHash: '',
      rol_Empleado: emp.rol_Empleado || 'Empleado',
    });
    setModal(true);
  };

  const guardarEmpleado = async () => {
    try {
      if (editId) {
        await updateEmpleado(editId, form);
        addToast('Empleado actualizado', 'success');
      } else {
        await crearEmpleado(form);
        addToast('Empleado creado', 'success');
      }
      setModal(false);
      getEmpleados().then(setEmpleados);
    } catch {
      addToast('Error al guardar empleado', 'error');
    }
  };

  const eliminarEmpleado = async (id) => {
    if (!confirm('Eliminar este empleado?')) return;
    try {
      await deleteEmpleado(id);
      addToast('Empleado eliminado', 'success');
      getEmpleados().then(setEmpleados);
    } catch {
      addToast('Error al eliminar empleado', 'error');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', background: 'var(--bone)' }}>
        <div className="container" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div><h1 style={{ marginBottom: '4px' }}>Usuarios</h1><p style={{ color: 'var(--muted)', fontSize: '14px' }}>Gestion de clientes y empleados</p></div>
          </div>

          <div className="tabs" style={{ marginBottom: '24px' }}>
            <button className={`tab ${tab === 'clientes' ? 'active' : ''}`} onClick={() => setTab('clientes')}>
              <Users size={16} /> Clientes
            </button>
            <button className={`tab ${tab === 'empleados' ? 'active' : ''}`} onClick={() => setTab('empleados')}>
              <Users size={16} /> Empleados
            </button>
          </div>

          {tab === 'clientes' && (
            <div className="table-card">
              {loading ? (
                <div className="card loading" style={{ height: '200px' }} />
              ) : (
                <table className="table">
                  <thead><tr><th>Nombre</th><th>Usuario</th><th>Correo</th><th>Telefono</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.iD_Cliente}>
                        <td style={{ fontWeight: 600 }}>{c.nombre} {c.apellido_Paterno} {c.apellido_Materno}</td>
                        <td>{c.usuario}</td>
                        <td>{c.correo_E}</td>
                        <td>{c.telefono}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="icon-btn delete" onClick={() => eliminarCliente(c.iD_Cliente)} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'empleados' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-terracotta btn-sm" onClick={abrirCrearEmpleado}>
                  <Plus size={16} /> Nuevo empleado
                </button>
              </div>
              <div className="table-card">
                {loading ? (
                  <div className="card loading" style={{ height: '200px' }} />
                ) : (
                  <table className="table">
                    <thead><tr><th>Nombre</th><th>Usuario</th><th>Correo</th><th>Rol</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
                    <tbody>
                      {empleados.map((e) => (
                        <tr key={e.iD_Empleado}>
                          <td style={{ fontWeight: 600 }}>{e.nombre} {e.apellido_Paterno} {e.apellido_Materno}</td>
                          <td>{e.usuario}</td>
                          <td>{e.correo_E}</td>
                          <td>
                            <span className={`badge ${e.rol_Empleado === 'Cocinero' ? 'low' : 'ok'}`}>
                              {e.rol_Empleado}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button className="icon-btn edit" onClick={() => abrirEditarEmpleado(e)} title="Editar">
                                <Pencil size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => eliminarEmpleado(e.iD_Empleado)} title="Eliminar">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px' }}>{editId ? 'Editar' : 'Nuevo'} empleado</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nombre</label><input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Apellido paterno</label><input className="input" value={form.apellido_Paterno} onChange={(e) => setForm({ ...form, apellido_Paterno: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Telefono</label><input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Correo</label><input className="input" type="email" value={form.correo_E} onChange={(e) => setForm({ ...form, correo_E: e.target.value })} /></div>
              <div className="form-group full"><label className="form-label">Usuario</label><input className="input" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} /></div>
              <div className="form-group full"><label className="form-label">Password {editId ? '(dejar vacio para no cambiar)' : ''}</label><input className="input" type="password" value={form.passwordHash} onChange={(e) => setForm({ ...form, passwordHash: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select className="input" value={form.rol_Empleado} onChange={(e) => setForm({ ...form, rol_Empleado: e.target.value })}>
                  <option value="Empleado">Empleado</option>
                  <option value="Cocinero">Cocinero</option>
                </select>
              </div>
            </div>
            <button className="btn btn-terracotta" style={{ marginTop: '24px', width: '100%' }} onClick={guardarEmpleado}>{editId ? 'Actualizar' : 'Crear'} empleado</button>
          </div>
        </div>
      )}
    </div>
  );
}
