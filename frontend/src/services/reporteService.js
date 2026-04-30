import api from './api';

export const getVentasDiarias = async () => {
  const res = await api.get('/reportes/ventas/diarias');
  return res.data;
};

export const getVentasSemana = async () => {
  const res = await api.get('/reportes/ventas/semana');
  return res.data;
};

export const getVentasMes = async () => {
  const res = await api.get('/reportes/ventas/mes');
  return res.data;
};

export const getProductosMasVendidos = async () => {
  const res = await api.get('/reportes/productos/mas-vendidos');
  return res.data;
};

export const getPedidosRecientes = async () => {
  const res = await api.get('/reportes/pedidos/recientes');
  return res.data;
};

export const getClientesRegistrados = async () => {
  const res = await api.get('/reportes/clientes');
  return res.data;
};

