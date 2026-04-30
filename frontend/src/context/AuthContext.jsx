import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (token && role) {
      setUser({ token, role, id: userId });
    }
    setLoading(false);
  }, []);

  const login = (token, role, id) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', id);
    setUser({ token, role, id });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const isClient = () => user?.role === 'Cliente';
  const isAdmin = () => user?.role === 'Admin';
  const isEmpleado = () => user?.role === 'Empleado';
  const isKitchen = () => user?.role === 'Empleado' || user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isClient, isAdmin, isEmpleado, isKitchen, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

