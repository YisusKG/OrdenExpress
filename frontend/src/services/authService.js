import api from './api';

export const loginCliente = async (data) => {
  const res = await api.post('/auth/login-cliente', data);
  return res.data;
};

export const loginAdmin = async (data) => {
  const res = await api.post('/auth/login-admin', data);
  return res.data;
};

export const loginEmpleado = async (data) => {
  const res = await api.post('/auth/login-empleado', data);
  return res.data;
};

export const registerCliente = async (data) => {
  const res = await api.post('/auth/register-cliente', data);
  return res.data;
};

export const registerEmpleado = async (data) => {
  const res = await api.post('/auth/register-empleado', data);
  return res.data;
};

