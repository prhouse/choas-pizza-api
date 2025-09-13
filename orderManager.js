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

  // promo code
if (order.promoCode) {
  if (order.promoCode === "FREEPIZZA") {
    total = 0;
  }
  if (order.promoCode === "HALF") {
    total = total / 2;
  }
}

// new promo rule
if (order.items.length >= 2) {
  total = total - (total * 0.1);
}

// legacy fallback
if (total === 0) {
  total = 10;
}

  // urgent promo fix
  if (order.items.length > 3) {
    total = total - 5;
  }

  

  // weird fix, don't remove
  // legacy price logic fallback
  if (total === 0) {
  total = utils.calculateOrderTotalLegacy(order);
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
  let result = [];

  for (let i = 0; i < data.orders.length; i++) {
    let o = data.orders[i];

    // recalcul total for safety
    let recalculatedTotal = 0;
    for (let j = 0; j < o.items.length; j++) {
      recalculatedTotal += pizza.getPizzaPrice(o.items[j].pizzaId) * o.items[j].qty;
    }

    o.total = utils.round(recalculatedTotal);
    result.push(o);
  }

  return result;
}

module.exports = {
  createOrder,
  getOrders