let menuData = {};

document.addEventListener('DOMContentLoaded', () => {
  loadMenuData();
  renderCategories();
  renderCategorySelect();
  renderItems();
});

function loadMenuData() {
  const data = localStorage.getItem('smartBilling_menuData');
  if (data) {
    menuData = JSON.parse(data);
  }
}

function saveMenuData() {
  localStorage.setItem('smartBilling_menuData', JSON.stringify(menuData));
  showToast('Menu updated successfully!', 'success');
  loadMenuData(); // Reload
  renderCategories();
  renderCategorySelect();
  renderItems();
}

// ================= CATEGORIES =================

function renderCategories() {
  const container = document.getElementById('categories-list');
  container.innerHTML = Object.keys(menuData).map(cat => `
    <div style="background:var(--glass-bg); border:1px solid var(--glass-border); padding:0.5rem 1rem; border-radius:30px; display:flex; gap:0.5rem; align-items:center;">
      <span>${cat}</span>
      <button style="background:transparent; border:none; color:var(--danger-color); cursor:pointer; font-weight:bold;" onclick="deleteCategory('${cat}')">&times;</button>
    </div>
  `).join('');
}

function addCategory() {
  const input = document.getElementById('newCategoryName');
  const catName = input.value.trim();
  
  if (!catName) {
    showToast('Category name cannot be empty', 'error');
    return;
  }
  
  if (menuData[catName]) {
    showToast('Category already exists', 'error');
    return;
  }
  
  menuData[catName] = [];
  input.value = '';
  saveMenuData();
}

function deleteCategory(catName) {
  if (confirm(`Are you sure you want to delete category "${catName}" and all its items?`)) {
    delete menuData[catName];
    // If the currently selected category in dropdown was this one, reset it
    const select = document.getElementById('categorySelect');
    if (select.value === catName) {
      select.selectedIndex = 0;
    }
    saveMenuData();
  }
}

function renderCategorySelect() {
  const select = document.getElementById('categorySelect');
  const currentVal = select.value;
  
  select.innerHTML = Object.keys(menuData).map(cat => `
    <option value="${cat}">${cat}</option>
  `).join('');
  
  if (Object.keys(menuData).includes(currentVal)) {
    select.value = currentVal;
  }
}

// ================= ITEMS =================

function renderItems() {
  const select = document.getElementById('categorySelect');
  const catName = select.value;
  const container = document.getElementById('items-grid');
  
  if (!catName || !menuData[catName]) {
    container.innerHTML = `<p style="color:var(--text-secondary); grid-column:1/-1; text-align:center;">No category selected or category is empty.</p>`;
    return;
  }
  
  const items = menuData[catName];
  
  if (items.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary); grid-column:1/-1; text-align:center;">No items in this category yet.</p>`;
    return;
  }
  
  container.innerHTML = items.map((item, index) => `
    <div class="manage-card">
      <img src="${item.image}" alt="Preview" class="image-preview-manage" id="img-preview-${item.id}">
      
      <div style="font-size:0.8rem; color:var(--text-secondary);">Name</div>
      <input type="text" id="edit-name-${item.id}" value="${item.name}">
      
      <div style="font-size:0.8rem; color:var(--text-secondary);">Price (₹)</div>
      <input type="number" id="edit-price-${item.id}" value="${item.price}">
      
      <div class="manage-actions" style="margin-top:1rem; display:flex; justify-content:space-between; width:100%;">
        <button class="btn btn-primary btn-small" onclick="updateItem('${catName}', '${item.id}')">Save Edit</button>
        <button class="btn btn-small" style="background:var(--danger-color); color:white; border:none;" onclick="deleteItem('${catName}', '${item.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function handleNewItemImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('newItemBase64').value = e.target.result;
      document.getElementById('newItemImageURL').value = ''; // clear url if file Uploaded
      showToast('Image file loaded successfully', 'info');
    };
    reader.readAsDataURL(file);
  }
}

function addItem() {
  const catName = document.getElementById('categorySelect').value;
  if (!catName || !menuData[catName]) {
    showToast('Please select a valid category first', 'error');
    return;
  }
  
  const name = document.getElementById('newItemName').value.trim();
  const price = document.getElementById('newItemPrice').value.trim();
  const urlBox = document.getElementById('newItemImageURL').value.trim();
  const fileBox = document.getElementById('newItemBase64').value.trim();
  
  if (!name || !price) {
    showToast('Name and Price are required.', 'error');
    return;
  }
  
  const imgUrl = fileBox || urlBox || 'https://via.placeholder.com/300x200?text=No+Image'; // Fallback
  
  const newItem = {
    id: 'item-' + new Date().getTime(),
    name: name,
    price: parseInt(price),
    image: imgUrl
  };
  
  menuData[catName].push(newItem);
  
  // clear form
  document.getElementById('newItemName').value = '';
  document.getElementById('newItemPrice').value = '';
  document.getElementById('newItemImageURL').value = '';
  document.getElementById('newItemBase64').value = '';
  document.getElementById('newItemImageFile').value = '';
  
  saveMenuData();
}

function updateItem(catName, itemId) {
  const itemIndex = menuData[catName].findIndex(i => i.id === itemId);
  if (itemIndex > -1) {
    const newName = document.getElementById(`edit-name-${itemId}`).value.trim();
    const newPrice = document.getElementById(`edit-price-${itemId}`).value.trim();
    
    if(!newName || !newPrice) {
      showToast('Name and price cannot be empty', 'error');
      return;
    }
    
    menuData[catName][itemIndex].name = newName;
    menuData[catName][itemIndex].price = parseInt(newPrice);
    
    saveMenuData();
  }
}

function deleteItem(catName, itemId) {
  if(confirm('Are you sure you want to delete this item?')) {
    menuData[catName] = menuData[catName].filter(i => i.id !== itemId);
    saveMenuData();
  }
}
