import api from './api';

export const crearCheckoutStripe = async (data) => {
  const res = await api.post('/stripe/checkout', data);
  return res.data;
};

export const confirmarSesionStripe = async (sessionId) => {
  const res = await api.post('/stripe/confirm-session', { sessionId });
  return res.data;
};

export const cancelarPedidoStripePendiente = async (pedidoId) => {
  const res = await api.post(`/stripe/cancel-pending/${pedidoId}`);
  return res.data;
};
