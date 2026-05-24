import api from './api';

export const getClientes = async () => {
  const res = await api.get('/usuarios/clientes');
  return res.data;
};

export const deleteCliente = async (id) => {
  const res = await api.delete(`/usuarios/clientes/${id}`);
  return res.data;
};

export const getEmpleados = async () => {
  const res = await api.get('/usuarios/empleados');
  return res.data;
};

export const crearEmpleado = async (data) => {
  const res = await api.post('/usuarios/empleados', data);
  return res.data;
};

export const updateEmpleado = async (id, data) => {
  const res = await api.put(`/usuarios/empleados/${id}`, data);
  return res.data;
};

export const deleteEmpleado = async (id) => {
  const res = await api.delete(`/usuarios/empleados/${id}`);
  return res.data;
};
