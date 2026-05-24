import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCliente, loginAdmin, loginEmpleado } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './auth.css';
import logo from '../../images/Logo.png';
import banderilla1 from '../../images/Banderilla1.jpg';
import banderilla3 from '../../images/Banderillas3.jpg';
import banderilla4 from '../../images/Banderillas4.jpg';
import arosImg from '../../images/Aros.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cliente');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !password) {
      addToast('Completa todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (rol === 'admin') {
        data = await loginAdmin({ Usuario: usuario, Contraseña: password });
      } else if (rol === 'cocinero' || rol === 'empleado') {
        data = await loginEmpleado({ Usuario: usuario, Contraseña: password });
      } else {
        data = await loginCliente({ Usuario: usuario, Contraseña: password });
      }

      if (rol === 'cocinero' && data.role !== 'Cocinero') {
        throw new Error('El usuario no tiene rol de cocinero');
      }
      if (rol === 'empleado' && data.role !== 'Empleado') {
        throw new Error('El usuario no tiene rol de empleado');
      }

      login(data.token, data.role, data.id);
      addToast('Bienvenido', 'success');
      if (rol === 'admin') navigate('/admin');
      else if (rol === 'cocinero') navigate('/cocina');
      else if (rol === 'empleado') navigate('/empleado');
      else navigate('/menu');
    } catch {
      addToast('Credenciales incorrectas', 'error');
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
          <div className="gi"><img src={banderilla3} alt="Banderilla" /></div>
          <div className="gi"><img src={banderilla1} alt="Banderilla" /></div>
          <div className="gi"><img src={banderilla4} alt="Banderilla" /></div>
          <div className="gi"><img src={arosImg} alt="Aros de cebolla" /></div>
        </div>

        <div className="auth-left__text">
          <h2>Tradición en cada <b>pincho</b>, sabor en cada mordida.</h2>
          <p>Desde 1995 entregando calidad y sabor auténticos.</p>
        </div>
      </div>

      <div className="auth-right">
        <span className="tag">ACCESO AL SISTEMA</span>
        <h1>Bienvenido.</h1>
        <p>Elige tu rol y accede al sistema</p>

        <div className="roles">
          <button className={rol === 'cliente' ? 'active' : ''} onClick={() => setRol('cliente')}>Cliente</button>
          <button className={rol === 'empleado' ? 'active' : ''} onClick={() => setRol('empleado')}>Empleado</button>
          <button className={rol === 'cocinero' ? 'active' : ''} onClick={() => setRol('cocinero')}>Cocinero</button>
          <button className={rol === 'admin' ? 'active' : ''} onClick={() => setRol('admin')}>Admin</button>
        </div>

        <input
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button className="btn-login" onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : `Entrar como ${rol}`}
        </button>

        <p className="register-text">
          No tienes cuenta? <a href="/register">Regístrate</a>
        </p>
      </div>
    </div>
  );
}