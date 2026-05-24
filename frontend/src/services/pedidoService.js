import api from './api';

export const getPedidos = async () => {
  const res = await api.get('/pedido');
  return res.data;
};

export const getTodosPedidos = async () => {
  const res = await api.get('/pedido/todos');
  return res.data;
};

export const getPedidosCliente = async (id) => {
  const res = await api.get(`/pedido/cliente/${id}`);
  return res.data;
};

export const getPedido = async (id) => {
  const res = await api.get(`/pedido/${id}`);
  return res.data;
};

export const getReciboPedido = async (id) => {
  const res = await api.get(`/pedido/recibo/${id}`);
  return res.data;
};

export const crearPedido = async (data) => {
  const res = await api.post('/pedido/crear', data);
  return res.data;
};

export const cambiarEstadoPedido = async (id, nuevoEstado) => {
  const res = await api.put(`/pedido/estado/${id}`, { nuevoEstado });
  return res.data;
};

