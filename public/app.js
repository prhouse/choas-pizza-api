let pizzas = [];
let selectedPizza = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchPizzas();
});

function fetchPizzas() {
  fetch('/pizzas')
    .then(r => r.json())
    .then(data => {
      pizzas = data;
      renderPizzas();
    });
}

function renderPizzas() {
  const list = document.getElementById('pizzaList');
  if (!list) return;
  list.innerHTML = '';

  pizzas.forEach(p => {
    const div = document.createElement('div');
    div.className =
      'flex justify-between items-center p-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50';
    div.innerHTML = `
      <span class="font-medium">${p.name}</span>
      <span class="text-gray-500">${p.price}€</span>
    `;
    div.onclick = () => selectPizza(p, div);
    list.appendChild(div);
  });
}

function selectPizza(pizza, el) {
  document.querySelectorAll('#pizzaList > div')
    .forEach(d => d.classList.remove('border-black'));
  el.classList.add('border-black');
  selectedPizza = pizza;
  updateSummary();
}

function changeQty(delta) {
  const input = document.getElementById('qty');
  if (!input) return;
  input.value = Math.max(1, Number(input.value) + delta);
  updateSummary();
}

function updateSummary() {
  if (!selectedPizza) return;
  const qtyInput = document.getElementById('qty');
  if (!qtyInput) return;

  const qty = Number(qtyInput.value);
  const totalHT = selectedPizza.price * qty;
  const vatAmount = totalHT * 0.1;
  const totalTTC = totalHT + vatAmount;

  document.getElementById('summaryName').innerText =
    `${selectedPizza.name} x${qty}`;
  document.getElementById('summaryPrice').innerText =
    `${totalHT.toFixed(2)}€`;

  document.getElementById('totalHT').innerText = `${totalHT.toFixed(2)}€`;
  document.getElementById('vatAmount').innerText = `${vatAmount.toFixed(2)}€`;
  document.getElementById('totalTTC').innerText = `${totalTTC.toFixed(2)}€`;
}

function placeOrder() {
  if (!selectedPizza) {
    alert('Please select a pizza first');
    return;
  }

  const email = document.getElementById('email').value;
  if (!email) {
    alert('Please enter your email');
    return;
  }

  const qty = Number(document.getElementById('qty').value);
  const promo = document.getElementById('promo').value;

  fetch('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        pizzaId: selectedPizza.id,
        qty: qty
      }],
      email: email,
      promoCode: promo
    })
  })
    .then(r => r.json())
    .then(data => {
      document.getElementById('result').innerText =
        JSON.stringify(data, null, 2);
    });
}

globalThis.changeQty = changeQty;
globalThis.selectPizza = selectPizza;
globalThis.placeOrder = placeOrder;
