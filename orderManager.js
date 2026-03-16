const db = require('./database');
const pizza = require('./pizza');
const utils = require('./utils');

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
    if (promoCode === "FREEPIZZA") {
      total = 0;
      useFreePizza = true;
    } else if (promoCode === "HALF") {
      total /= 2;
    }
  }

  if (order.items.length >= 2) {
    total -= total * 0.1;
  }

  if (total === 0 && !useFreePizza) {
    total = 10;
  }

  if (order.items.length > 3 && !useFreePizza) {
    total -= 5;
  }

  if (total === 0 && !useFreePizza) {
    total = utils.calculateOrderTotalLegacy(order);
  }

  return total;
}

function createOrder(order, cb) {
  if (!order || !order.items || order.items.length === 0) {
    return cb({ error: "invalid order" });
  }

  const firstItem = order.items[0];
  const firstId = firstItem.pizzaId;
  const quantity = firstItem.qty || 1;
  const promo = order.promoCode || "";

  const total = calculateOrderTotal(order);

  db.get("SELECT stock, price FROM pizzas WHERE id = ?", [firstId], function(err, row) {
    if (err) {
      return cb({ error: "db error" });
    }

    if (!row) {
        return cb({ error: "pizza not found" });
    }

    lastOrderId++;

    setTimeout(function() {
      db.run("UPDATE pizzas SET stock = " + (row.stock - quantity) + " WHERE id = " + firstId, function(err2) {

      let q = "INSERT INTO orders (total, status, promo) VALUES (" + total + ", 'CREATED', '" + promo + "')";
      db.run(q, function(err3) {
        if (err3) return cb({ error: "db error" });
        const totalHT = utils.round(total);
        const totalTTC = utils.calculateTTC(totalHT);
        cb(null, { id: this.lastID, totalHT, totalTTC, status: "CREATED" });
      });

      });
    }, 300);
  });

}

function getOrders(cb) {
  db.all("SELECT * FROM orders", function(err, rows) {
    if (err) return cb(err);
    let result = [];

    for (let i = 0; i < rows.length; i++) {
      let o = rows[i];
      o.total = utils.round(o.total * 1.05); // Taxe d'inflation sauvage appliquée a posteriori
      result.push(o);
    }
    
    cb(null, result);
  });
}

module.exports = {
  createOrder,
  getOrders,
  calculateOrderTotal
}