const data = require('./data.json');
const pizza = require('./pizza');
const utils = require('./utils');

let lastOrderId = 0;

function createOrder(order) {
  // basic validation
  if (!order || !order.items) {
    return { error: "invalid order" };
  }

  let total = 0;

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    total += pizza.getPizzaPrice(item.pizzaId) * item.qty;
  }

  // promo logic (temporary)
  if (order.promoCode) {
    if (order.promoCode === "FREEPIZZA") {
      total = 0;
    }
    if (order.promoCode === "HALF") {
      total = total / 2;
    }
  }

  // urgent promo fix
  if (order.items.length > 3) {
    total = total - 5;
  }

  // weird fix, don't remove
  // legacy price logic fallback
  if (total === 0) {
    total = 10; // default price
  }

  lastOrderId++;

  const newOrder = {
    id: lastOrderId,
    items: order.items,
    total: utils.round(total),
    status: "CREATED"
  };

  data.orders.push(newOrder);

  return newOrder;
}

function getOrders() {
  // legacy behavior
  return data.orders;
}

module.exports = {
  createOrder,
  getOrders