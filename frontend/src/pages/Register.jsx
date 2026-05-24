import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCliente } from '../services/authService';
import { useToast } from '../components/Toast';
import './auth.css';
import logo from '../../images/Logo.png';
import banderilla1 from '../../images/Banderilla1.jpg';
import banderilla3 from '../../images/Banderillas3.jpg';
import banderilla4 from '../../images/Banderillas4.jpg';
import arosImg from '../../images/Aros.jpg';

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
        <div className="auth-left__logo-area">
          <img src={logo} alt="Pinchos Banderillas" />
          <span>Pinchos Banderillas</span>
        </div>

        <div className="auth-left__grid">
          <div className="gi"><img src={banderilla1} alt="Banderilla" /></div>
          <div className="gi"><img src={banderilla4} alt="Banderilla" /></div>
          <div className="gi"><img src={banderilla3} alt="Banderilla" /></div>
          <div className="gi"><img src={arosImg} alt="Aros de cebolla" /></div>
        </div>

        <div className="auth-left__text">
          <h2>Únete a la familia <b>Pinchos Banderillas</b>.</h2>
          <p>Crea tu cuenta y descubre todo lo que tenemos para ti.</p>
        </div>
      </div>

      <div className="auth-right">
        <span className="tag">CREAR CUENTA</span>
        <h1>Regístrate.</h1>
        <p>Completa tus datos para comenzar</p>

        <input name="Nombre" placeholder="Nombre *" value={form.Nombre} onChange={handleChange} />
        <input name="Apellido_Paterno" placeholder="Apellido paterno *" value={form.Apellido_Paterno} onChange={handleChange} />
        <input name="Apellido_Materno" placeholder="Apellido materno" value={form.Apellido_Materno} onChange={handleChange} />
        <input name="Usuario" placeholder="Usuario *" value={form.Usuario} onChange={handleChange} />
        <input name="Telefono" placeholder="Teléfono" value={form.Telefono} onChange={handleChange} />
        <input name="Correo_E" placeholder="Correo electrónico *" value={form.Correo_E} onChange={handleChange} />
        <input name="Contraseña" type="password" placeholder="Contraseña *" value={form.Contraseña} onChange={handleChange} />

        <button className="btn-login" onClick={handleRegister} disabled={loading}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

        <p className="register-text">
          Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}