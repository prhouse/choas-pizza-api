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

module.exports = {
  round,
  formatPrice
};