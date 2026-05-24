import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCliente, actualizarCliente, actualizarFoto } from '../services/clienteService';
import { useToast } from '../components/Toast';
import { Camera, Save } from 'lucide-react';
import { API_ORIGIN } from '../services/api';

export default function Perfil() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!user?.id) return;
    getCliente(user.id).then((data) => {
      setForm({ nombre: data.nombre || '', apellido_Paterno: data.apellido_Paterno || '', apellido_Materno: data.apellido_Materno || '', telefono: data.telefono || '', correo_E: data.correo_E || '', usuario: data.usuario || '', foto_Perfil: data.foto_Perfil || '', contraseña: '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const guardar = async () => {
    setSaving(true);
    try {
      await actualizarCliente(user.id, form);
      const foto = fileRef.current?.files[0];
      if (foto) await actualizarFoto(user.id, foto);
      addToast('Perfil actualizado', 'success');
      setUser({ ...user, nombre: form.nombre });
    } catch { addToast('Error al actualizar', 'error'); }
    finally { setSaving(false); }
  };

  const fotoUrl = form.foto_Perfil ? `${API_ORIGIN}/perfil/${form.foto_Perfil}` : '';

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '700px' }}>
        <h1 style={{ marginBottom: '32px' }}>Mi perfil</h1>
        {loading ? (
          <div className="card loading" style={{ height: '400px' }} />
        ) : (
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
              <div style={{ position: 'relative' }}>
                {fotoUrl ? (
                  <img src={fotoUrl} alt="Foto" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--sand)', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800 }}>
                    {(form.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--terracotta)', color: 'var(--white)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={14} />
                </button>
                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} />
              </div>
              <div>
                <h3 style={{ marginBottom: '2px' }}>{form.nombre || 'Usuario'}</h3>
                <p style={{ fontSize: '14px', color: 'var(--muted)' }}>{form.correo_E}</p>
              </div>
            </div>
            <div className="form-grid">
              {[
                { key: 'nombre', label: 'Nombre', type: 'text' },
                { key: 'apellido_Paterno', label: 'Apellido paterno', type: 'text' },
                { key: 'apellido_Materno', label: 'Apellido materno', type: 'text' },
                { key: 'telefono', label: 'Telefono', type: 'tel' },
                { key: 'correo_E', label: 'Correo', type: 'email' },
                { key: 'usuario', label: 'Usuario', type: 'text' },
                { key: 'contraseña', label: 'Nueva contraseña', type: 'password' }
              ].map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="input" type={f.type} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <button className="btn btn-terracotta" onClick={guardar} disabled={saving} style={{ marginTop: '24px' }}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>
  );
}
