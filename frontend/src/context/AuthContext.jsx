import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    return token && role ? { token, role, id: userId } : null;
  });
  const loading = false;

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
  const isCocinero = () => user?.role === 'Cocinero';
  const isKitchen = () => user?.role === 'Cocinero' || user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isClient, isAdmin, isEmpleado, isCocinero, isKitchen, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

