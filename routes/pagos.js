const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../db/config');

// Verificar si Stripe está configurado
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('⚠️ Stripe no configurado. Los pagos serán en efectivo.');
}

/* =========================
   CREAR SESIÓN DE PAGO (STRIPE CHECKOUT)
========================= */
router.post('/crear-sesion-pago', async (req, res) => {
  const { productos, idPedido } = req.body;

  if (!stripe) {
    return res.status(503).json({ 
      message: 'Pagos con tarjeta no disponibles. Use efectivo en tienda.',
      modoPago: 'efectivo'
    });
  }

  if (!productos || productos.length === 0) {
    return res.status(400).json({ message: 'No hay productos en el carrito' });
  }

  try {
    const lineItems = productos.map(p => ({
      price_data: {
        currency: 'mxn',
        product_data: { 
          name: p.Nombre_P || p.nombre,
          description: p.Descripcion || ''
        },
        unit_amount: Math.round((p.Precio_Venta || p.precio) * 100), // Stripe usa centavos
      },
      quantity: p.Cantidad || p.cantidad,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago-exitoso?id=${idPedido}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/carrito`,
      metadata: {
        idPedido: idPedido?.toString() || ''
      }
    });

    res.json({ 
      id: session.id, 
      url: session.url,
      modoPago: 'stripe'
    });
  } catch (err) {
    console.error('Error al crear sesión de pago:', err);
    res.status(500).json({ message: 'Error al procesar pago con tarjeta' });
  }
});

/* =========================
   WEBHOOK DE STRIPE (Confirmar pago)
========================= */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (!stripe) {
    return res.status(503).send();
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento de pago exitoso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const idPedido = session.metadata?.idPedido;

    if (idPedido) {
      try {
        const pool = await sql.connect(db);
        await pool.request()
          .input('ID_Pedido', sql.Int, idPedido)
          .input('MetodoPago', sql.VarChar, 'Tarjeta')
          .query(`
            UPDATE Pedido 
            SET Metodo_Pago = @MetodoPago,
                Estado = 'Pagado'
            WHERE ID_Pedido = @ID_Pedido
          `);
        console.log(`✅ Pago confirmado para pedido ${idPedido}`);
      } catch (err) {
        console.error('Error al actualizar pago:', err);
      }
    }
  }

  res.json({ received: true });
});

/* =========================
   CONFIRMAR PAGO EN EFECTIVO
========================= */
router.post('/pago-efectivo', async (req, res) => {
  const { idPedido } = req.body;

  if (!idPedido) {
    return res.status(400).json({ message: 'ID de pedido requerido' });
  }

  try {
    const pool = await sql.connect(db);
    await pool.request()
      .input('ID_Pedido', sql.Int, idPedido)
      .input('MetodoPago', sql.VarChar, 'Efectivo')
      .query(`
        UPDATE Pedido 
        SET Metodo_Pago = @MetodoPago
        WHERE ID_Pedido = @ID_Pedido
      `);

    res.json({ message: 'Pago en efectivo registrado. Pague al recibir su pedido.' });
  } catch (err) {
    console.error('Error al registrar pago en efectivo:', err);
    res.status(500).json({ message: 'Error al procesar pago' });
  }
});

/* =========================
   OBTENER MÉTODOS DE PAGO DISPONIBLES
========================= */
router.get('/metodos', async (req, res) => {
  const metodos = [];
  
  if (stripe && process.env.STRIPE_SECRET_KEY) {
    metodos.push({ 
      id: 'tarjeta', 
      nombre: 'Pago con Tarjeta',
      icono: '💳'
    });
  }
  
  metodos.push({ 
    id: 'efectivo', 
    nombre: 'Pago en Efectivo',
    icono: '💵'
  });

  res.json({ metodos });
});

module.exports = router;

