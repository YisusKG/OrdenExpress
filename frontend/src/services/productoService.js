import api from './api';

export const getProductos = async () => {
  const res = await api.get('/producto');
  return res.data;
};

export const getMenu = async () => {
  const res = await api.get('/producto/menu');
  return res.data;
};

export const getInventario = async () => {
  const res = await api.get('/producto/inventario');
  return res.data;
};

export const getProducto = async (id) => {
  const res = await api.get(`/producto/${id}`);
  return res.data;
};

export const crearProducto = async (formData) => {
  const res = await api.post('/producto', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const modificarProducto = async (id, data) => {
  const res = await api.put(`/producto/${id}`, data);
  return res.data;
};

export const eliminarProducto = async (id) => {
  const res = await api.delete(`/producto/${id}`);
  return res.data;
};

export const entradaInventario = async (id, cantidad) => {
  const res = await api.put(`/producto/entrada/${id}`, cantidad);
  return res.data;
};

