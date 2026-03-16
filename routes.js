const express = require('express');
const router = express.Router();
const pizza = require('./pizza');
const orders = require('./orderManager');

router.get('/pizzas', (req, res) => {
  pizza.getAllPizzas((err, rows) => {
    if (err) res.status(500).send("err");
    else res.json(rows);
  });
});

router.post('/orders', (req, res) => {
  orders.createOrder(req.body, (err, result) => {
    if (err) res.status(400).json(err);
    else res.json(result);
  });
});

router.get('/orders', (req, res) => {
  orders.getOrders((err, result) => {
    res.json(result);
  });
});

router.put('/orders/:id/status', (req, res) => {
  const orderId = Number.parseInt(req.params.id, 10);
  const { status } = req.body;

  if (Number.isNaN(orderId)) {
    return res.status(400).json({ error: "Invalid order ID format" });
  }

  if (!status) {
    return res.status(400).json({ error: "Status field is required in the body" });
  }

  orders.updateOrderStatus(orderId, status, (err, result) => {
    if (err) {
      return res.status(err.status || 500).json({ error: err.error });
    }
    res.json(result);
  });
});

module.exports = router;