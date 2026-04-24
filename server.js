const express = require('express');
const cors = require('cors');
const clienteRoutes = require('./routes/cliente');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:7000', 'https://ordenexpress.com'], // Fixed SonarQube security hotspot
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/cliente', clienteRoutes);

const productoRoutes = require('./routes/producto');
app.use('/producto', productoRoutes);

app.use('/fotos', express.static('fotos'));

app.use('/perfil', express.static('perfil'));

// Servir archivos estáticos del Frontend (public)
app.use(express.static('public'));

const pedidoRoutes = require('./routes/pedido');
app.use('/pedido', pedidoRoutes);

// Rutas de reportes
const reportesRoutes = require('./routes/reportes');
app.use('/reportes', reportesRoutes);

// Rutas de pagos (Stripe)
const pagosRoutes = require('./routes/pagos');
app.use('/pagos', pagosRoutes);

// SOCKET.IO REAL-TIME
require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:7000', 'https://ordenexpress.com'], methods: ["GET", "POST"] } // Fixed: hardcoded safe origins for dev/prod
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('unirse-cocina', () => {
    socket.join('cocina');
  });

  socket.on('unirse-cliente', (clienteId) => {
    socket.join(`cliente-${clienteId}`);
  });

  // Emitir nuevo pedido a cocina
  socket.on('nuevo-pedido', (pedido) => {
    io.to('cocina').emit('pedido-nuevo', pedido);
  });

  // Cambiar estado → notificar cliente
  socket.on('estado-cambiado', (pedido) => {
    io.to(`cliente-${pedido.ID_Cliente}`).emit('pedido-actualizado', pedido);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor + Socket.io en http://localhost:${PORT}`);
});
