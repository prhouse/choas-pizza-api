const db = require('./database');
const pizza = require('./pizza');
const utils = require('./utils');
const util = require('node:util');

const PromoCodes = {
  FREE_PIZZA: "FREEPIZZA",
  HALF: "HALF"
};

const OrderDefaults = {
  FREE: 0,
  FALLBACK_PRICE: 10,
  BIG_ORDER_THRESHOLD: 3,
  BIG_ORDER_DISCOUNT: 5
};

let lastOrderId = 0;

function calculateOrderTotal(order) {
  let total = 0;

  for (const item of order.items) {
    const price = pizza.getPizzaPrice(item.pizzaId);
    if (price !== undefined) {
      total += price * (item.qty || 1);
    }
  }

  const promoCode = order.promoCode;
  let useFreePizza = false;

  if (promoCode) {
    if (promoCode === PromoCodes.FREE_PIZZA) {
      total = OrderDefaults.FREE;
      useFreePizza = true;
    } else if (promoCode === PromoCodes.HALF) {
      total /= 2;
    }
  }

  if (order.items.length >= 2) {
    total -= total * 0.1;
  }

  if (total === OrderDefaults.FREE && !useFreePizza) {
    total = OrderDefaults.FALLBACK_PRICE;
  }

  if (order.items.length > OrderDefaults.BIG_ORDER_THRESHOLD && !useFreePizza) {
    total -= OrderDefaults.BIG_ORDER_DISCOUNT;
    if (total === OrderDefaults.FREE) {
      total = utils.calculateOrderTotalLegacy(order);
    }
  }

  return total;
}

const dbGet = util.promisify(db.get.bind(db));
const dbRun = util.promisify(db.run.bind(db));

async function createOrder(order, cb) {
  if (!order?.items?.length) {
    return cb({ error: "invalid order" });
  }

  const email = order.email || "";
  if (!email) {
    return cb({ error: "email is required" });
  }

  const firstItem = order.items[0];
  const firstId = firstItem.pizzaId;
  const quantity = firstItem.qty || 1;
  const promo = order.promoCode || "";
  const total = calculateOrderTotal(order);

  try {
    const row = await dbGet("SELECT stock, price FROM pizzas WHERE id = ?", [firstId]);
    if (!row) {
      return cb({ error: "pizza not found" });
    }

    lastOrderId++;

    await dbRun("UPDATE pizzas SET stock = ? WHERE id = ?", [row.stock - quantity, firstId]);

    const query = "INSERT INTO orders (total, status, promo, email) VALUES (?, 'CREATED', ?, ?)";
    await dbRun(query, [total, promo, email]);

    const lastOrderRow = await dbGet("SELECT last_insert_rowid() as id");

    const totalHT = utils.round(total);
    const totalTTC = utils.calculateTTC(totalHT);

    cb(null, { id: lastOrderRow.id, totalHT, totalTTC, status: "CREATED" });
  } catch (err) {
    console.error(err);
    cb({ error: "db error" });
  }
}

function formatOrderResponse(order) {
  const totalHT = utils.round(order.total);
  const totalTTC = utils.calculateTTC(totalHT);
  return {
    ...order,
    totalHT,
    totalTTC
  };
}

function getOrdersByEmail(email, cb) {
  if (!email) return cb({ error: "email is required" });

  db.all("SELECT * FROM orders WHERE email = ?", [email], function (err, rows) {
    if (err) return cb(err);
    cb(null, rows.map(formatOrderResponse));
  });
}

const VALID_STATUSES = new Set(['PREPARING', 'DELIVERING', 'DELIVERED']);

function updateOrderStatus(id, status, cb) {
  if (!VALID_STATUSES.has(status)) {
    return cb({ error: "Invalid status provided. Must be one of: PREPARING, DELIVERING, DELIVERED", status: 400 });
  }

  const query = "UPDATE orders SET status = ? WHERE id = ?";
  db.run(query, [status, id], function (err) {
    if (err) {
      return cb({ error: "Database error occurred", status: 500 });
    }
    if (this.changes === 0) {
      return cb({ error: "Order not found", status: 404 });
    }
    cb(null, { id, status });
  });
}

function getOrders(cb) {
  db.all("SELECT * FROM orders", function (err, rows) {
    if (err) return cb(err);
    cb(null, rows.map(formatOrderResponse));
  });
}

module.exports = {
  createOrder,
  getOrders,
  getOrdersByEmail,
  calculateOrderTotal,
  updateOrderStatus
};