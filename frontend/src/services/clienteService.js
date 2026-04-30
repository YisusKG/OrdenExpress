import api from './api';

export const getCliente = async (id) => {
  const res = await api.get(`/cliente/${id}`);
  return res.data;
};

export const actualizarCliente = async (id, data) => {
  const res = await api.put(`/cliente/${id}`, data);
  return res.data;
};

export const actualizarFoto = async (id, formData) => {
  const res = await api.put(`/cliente/foto/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

