import api from "./api";

export const getPedidosRecepcion = async () => {
  const res = await api.get("/pedido/recepcion");
  return res.data;
};

export const buscarPorFolio = async (folio) => {
  const res = await api.get(`/pedido/folio/${encodeURIComponent(folio)}`);
  return res.data;
};

export const cobrarPedido = async (id) => {
  const res = await api.put(`/pedido/cobrar/${id}`);
  return res.data;
};

export const entregarPedido = async (id) => {
  const res = await api.put(`/pedido/entregar/${id}`);
  return res.data;
};
