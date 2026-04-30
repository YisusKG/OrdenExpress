import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCliente } from '../services/authService';
import { useToast } from '../components/Toast';
import './auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    Nombre: '',
    Apellido_Paterno: '',
    Apellido_Materno: '',
    Usuario: '',
    Telefono: '',
    Correo_E: '',
    Contraseña: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.Nombre || !form.Apellido_Paterno || !form.Usuario || !form.Correo_E || !form.Contraseña) {
      addToast('Completa los campos obligatorios', 'error');
      return;
    }
    setLoading(true);
    try {
      await registerCliente(form);
      addToast('Registro exitoso', 'success');
      navigate('/login');
    } catch {
      addToast('Error al registrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img
          src="https://images.unsplash.com/photo-1551218808-94e220e084d2"
          alt="cocina"
        />
        <div className="overlay">
          <h2>Únete a la experiencia.</h2>
        </div>
      </div>

      <div className="auth-right">
        <h1>Crear cuenta</h1>
        <p>Completa tus datos para comenzar</p>

        <input name="Nombre" placeholder="Nombre *" value={form.Nombre} onChange={handleChange} />
        <input name="Apellido_Paterno" placeholder="Apellido paterno *" value={form.Apellido_Paterno} onChange={handleChange} />
        <input name="Apellido_Materno" placeholder="Apellido materno" value={form.Apellido_Materno} onChange={handleChange} />
        <input name="Usuario" placeholder="Usuario *" value={form.Usuario} onChange={handleChange} />
        <input name="Telefono" placeholder="Teléfono" value={form.Telefono} onChange={handleChange} />
        <input name="Correo_E" placeholder="Correo electrónico *" value={form.Correo_E} onChange={handleChange} />
        <input name="Contraseña" type="password" placeholder="Contraseña *" value={form.Contraseña} onChange={handleChange} />

        <button onClick={handleRegister} disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}

