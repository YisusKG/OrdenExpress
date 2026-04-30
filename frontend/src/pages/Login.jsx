import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCliente, loginAdmin, loginEmpleado } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './auth.css';

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
      } else if (rol === 'cocinero') {
        data = await loginEmpleado({ Usuario: usuario, Contraseña: password });
      } else {
        data = await loginCliente({ Usuario: usuario, Contraseña: password });
      }
      login(data.token, data.role, data.id);
      addToast('Bienvenido', 'success');
      if (rol === 'admin') navigate('/admin');
      else if (rol === 'cocinero') navigate('/cocina');
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
        <img
          src="https://images.unsplash.com/photo-1551218808-94e220e084d2"
          alt="cocina"
        />
        <div className="overlay">
          <h2>La cocina moderna comienza con un <b>login</b>.</h2>
        </div>
      </div>

      <div className="auth-right">
        <span className="tag">ACCESO SEGURO</span>

        <h1>Bienvenido.</h1>
        <p>Elige tu rol y accede al sistema</p>

        <div className="roles">
          <button
            className={rol === 'cliente' ? 'active' : ''}
            onClick={() => setRol('cliente')}
          >
            Cliente
          </button>

          <button
            className={rol === 'cocinero' ? 'active' : ''}
            onClick={() => setRol('cocinero')}
          >
            Cocinero
          </button>

          <button
            className={rol === 'admin' ? 'active' : ''}
            onClick={() => setRol('admin')}
          >
            Admin
          </button>
        </div>

        <input
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-login" onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : `Entrar como ${rol} →`}
        </button>

        <p className="register-text">
          No tienes cuenta? <a href="/register">Registrate</a>
        </p>
      </div>
    </div>
  );
}
