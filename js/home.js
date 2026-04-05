let currentCart = {}; // id -> { item, quantity }
let menuData = {};

document.addEventListener('DOMContentLoaded', () => {
  // Read from localStorage (assuming app.js initialized it)
  const storedMenu = localStorage.getItem('smartBilling_menuData');
  if (storedMenu) {
    menuData = JSON.parse(storedMenu);
  } else {
    menuData = {};
  }
  
  renderMenu();
});

function renderMenu() {
  const tabsContainer = document.getElementById('category-tabs');
  const sectionsContainer = document.getElementById('sections-container');
  
  let tabsHtml = '';
  let sectionsHtml = '';
  
  let isFirst = true;
  for (const category in menuData) {
    const activeClass = isFirst ? 'active' : '';
    
    tabsHtml += `<button class="tab-btn ${activeClass}" onclick="switchTab('${category}')" id="tab-${category}">${category}</button>`;
    
    const items = menuData[category];
    const itemsHtml = items.map(item => `
      <div class="item-card glass">
        <img src="${item.image}" alt="${item.name}" class="item-image" loading="lazy">
        <div class="item-details">
          <span class="item-name">${item.name}</span>
          <span class="item-price">₹${item.price}</span>
        </div>
        <div class="quantity-control">
          <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
          <input type="number" class="qty-input" id="qty-${item.id}" value="${currentCart[item.id] ? currentCart[item.id].quantity : 0}" min="0" readonly>
          <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');
    
    sectionsHtml += `
      <section id="section-${category}" class="menu-section ${activeClass}">
        <h2 class="section-title">🍽️ ${category}</h2>
        <div class="items-grid">
          ${itemsHtml}
        </div>
      </section>
    `;
    
    isFirst = false;
  }
  
  tabsContainer.innerHTML = tabsHtml;
  sectionsContainer.innerHTML = sectionsHtml;
}

function switchTab(category) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${category}`).classList.add('active');
  
  document.querySelectorAll('.menu-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`section-${category}`).classList.add('active');
}

function updateQuantity(itemId, change) {
  const inputEl = document.getElementById(`qty-${itemId}`);
  let currentVal = parseInt(inputEl.value) || 0;
  
  let newVal = currentVal + change;
  if(newVal < 0) newVal = 0;
  
  inputEl.value = newVal;

  const item = findItemById(itemId);
  
  if (newVal > 0 && item) {
    currentCart[itemId] = { item, quantity: newVal };
  } else {
    delete currentCart[itemId];
  }
}

function findItemById(id) {
  for (let cat in menuData) {
    const found = menuData[cat].find(i => i.id === id);
    if (found) return found;
  }
  return null;
}

function calculateTotal() {
  let total = 0;
  for (let id in currentCart) {
    total += currentCart[id].item.price * currentCart[id].quantity;
  }
  
  const totalEl = document.getElementById('grand-total');
  totalEl.style.transform = 'scale(1.2)';
  totalEl.style.transition = 'transform 0.2s';
  
  setTimeout(() => {
    totalEl.textContent = `₹${total}`;
    totalEl.style.transform = 'scale(1)';
  }, 200);

  if(total > 0) {
    showToast(`Calculated: ₹${total}`, 'info');
  }
  
  return total;
}

function saveOrder() {
  const total = calculateTotal();
  if (total === 0) {
    showToast('Cart is empty. Please add items before saving.', 'error');
    return;
  }

  const orderItems = Object.values(currentCart).map(c => ({
    id: c.item.id,
    name: c.item.name,
    price: c.item.price,
    quantity: c.quantity, // ✅ unchanged
    image: c.item.image
  }));

  const now = new Date();

  const order = {
    id: 'ORD-' + now.getTime(),
    timestamp: now.toISOString(),
    date: now.toISOString().split("T")[0], // ✅ added for AI
    items: orderItems,
    total: total
  };

  let orders = JSON.parse(localStorage.getItem('orders') || '[]'); // ✅ changed key
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders)); // ✅ changed key

  showToast('Order saved successfully!', 'success');

  resetCart();
}

function resetCart() {
  currentCart = {};
  document.querySelectorAll('.qty-input').forEach(el => el.value = '0');
  document.getElementById('grand-total').textContent = '₹0';
}