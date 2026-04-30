# Plan de Conexión Frontend-Backend

## Pasos Completados

### Frontend
- [x] 1. CardProducto.jsx - Reescrito con propiedades correctas (`nombre_P`, `precio_Venta`, `imagen`) y `useCart`
- [x] 2. Carrito.jsx - Corregidos nombres: `updateQuantity`, `removeItem`, `clearCart`
- [x] 3. Cocina.jsx - Corregido `$` duplicado en precios y acento en `"En Preparación"`
- [x] 4. Pedidos.jsx - Corregido acento en estado `"En Preparación"`
- [x] 5. Perfil.jsx - Corregidas importaciones (`actualizarCliente`, `actualizarFoto`)
- [x] 6. Inventario.jsx - Corregida importación (`entradaInventario`)
- [x] 7. GestionarProductos.jsx - Corregidas importaciones (`modificarProducto`, `eliminarProducto`)

### Backend
- [x] 8. ClienteController.cs - Agregados endpoints `GET /{id}` y `PUT /{id}`
- [x] 9. PedidoController.cs - Eliminado `[Authorize(Policy = "Cliente")]` de clase, agregado `[Authorize]` general
- [x] 10. PedidoController.cs - Estado inicial cambiado de `"PendientePago"` a `"Pendiente"` para integración con Kanban


