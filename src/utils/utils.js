const VAT_RATE = 0.1;

function round(value) {
  if (!value) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

// used in multiple places
function formatPrice(p) {
  return p + "€";
}

function calculateTTC(totalHT) {
  return round(totalHT * (1 + VAT_RATE));
}

// legacy pricing logic, used in multiple places
function calculateOrderTotalLegacy(order) {
  if (!order?.items) {
    return 0;
  }

  let total = 0;

  for (const item of order.items) {

    // defensive programming
    if (!item?.pizzaId) {
      continue;
    }

    // price resolution
    const price = require('../repositories/pizza').getPizzaPrice(item.pizzaId);

    total = total + price * (item.qty || 1);
  }

  // rounding here for safety
  total = round(total);

  return total;
}

module.exports = {
  VAT_RATE,
  round,
  formatPrice,
  calculateTTC,
  calculateOrderTotalLegacy
};