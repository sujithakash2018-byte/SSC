document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});

function renderHistory() {
  const historyList = document.getElementById('history-list');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]'); // ✅ changed key
  
  // Sort orders by timestamp descending
  orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (orders.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state glass fade-in">
        <h3>No Order History</h3>
        <p>Looks like you haven't saved any orders yet.</p>
        <br>
        <a href="index.html" class="btn btn-primary" style="text-decoration:none; display:inline-block;">Go to Menu</a>
      </div>
    `;
    return;
  }

  const html = orders.map(order => {
    const dateObj = new Date(order.timestamp);
    const dateString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
    
    const itemsHtml = order.items.map(item => `
      <div class="history-item">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <div class="history-item-details">
          <span class="history-item-name">${item.name}</span>
          <span class="history-item-qty">${item.quantity} × ₹${item.price}</span>
        </div>
        <span class="history-item-price">₹${item.quantity * item.price}</span>
      </div>
    `).join('');

    return `
      <div class="history-card glass fade-in">
        <div class="history-header">
          <div>
            <span class="history-id">${order.id}</span>
            <span class="history-date" style="margin-left:1rem;">${dateString}</span>
          </div>
          <button class="btn" style="background:var(--danger-color); padding: 0.4rem 0.8rem; font-size: 0.9rem;" onclick="deleteOrder('${order.id}')">Delete</button>
        </div>
        <div class="history-items">
          ${itemsHtml}
        </div>
        <div class="history-footer">
          Total: <span style="color: var(--success-color); margin-left: 0.5rem;">₹${order.total}</span>
        </div>
      </div>
    `;
  }).join('');

  historyList.innerHTML = html;
}

function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this order? This action will affect total sales data.")) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]'); // ✅ changed key
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(orders)); // ✅ changed key
    
    showToast('Order deleted successfully.', 'success');
    renderHistory();
  }
}