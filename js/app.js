document.addEventListener('DOMContentLoaded', () => {
  // Initialize brand settings
  initBrandSettings();
  // Initialize menu data
  initMenuData();
});

function initMenuData() {
  const existingMenu = localStorage.getItem('smartBilling_menuData');
  if (!existingMenu) {
    const defaultMenu = {
      "Drinks": [
        { id: 'd1', name: 'Cold Coffee', price: 120, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=300&q=80' },
        { id: 'd2', name: 'Iced Tea', price: 90, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=300&q=80' },
        { id: 'd3', name: 'Mango Smoothie', price: 150, image: 'https://images.unsplash.com/photo-1546815340-9a370e0f80bc?auto=format&fit=crop&w=300&q=80' }
      ],
      "Meals": [
        { id: 'm1', name: 'Classic Burger', price: 250, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
        { id: 'm2', name: 'Margherita Pizza', price: 350, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80' },
        { id: 'm3', name: 'Grilled Sandwich', price: 180, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80' }
      ],
      "Snacks": [
        { id: 's1', name: 'French Fries', price: 100, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=300&q=80' },
        { id: 's2', name: 'Garlic Bread', price: 120, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=300&q=80' },
        { id: 's3', name: 'Nachos & Salsa', price: 180, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=300&q=80' }
      ]
    };
    localStorage.setItem('smartBilling_menuData', JSON.stringify(defaultMenu));
  }
}


function initBrandSettings() {
  const brandNameObj = localStorage.getItem('smartBilling_brandName');
  const brandLogoObj = localStorage.getItem('smartBilling_brandLogo');

  const defaultName = "SmartFlow SaaS";
  const defaultLogo = "https://images.unsplash.com/photo-1550592704-6c7baba442ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"; // Premium abstract generic logo

  const bName = brandNameObj ? brandNameObj : defaultName;
  const bLogo = brandLogoObj ? brandLogoObj : defaultLogo;

  // Update DOM elements
  const logoEls = document.querySelectorAll('.nav-logo');
  logoEls.forEach(el => el.src = bLogo);

  const nameEls = document.querySelectorAll('.nav-brand-name');
  nameEls.forEach(el => el.textContent = bName);
}

// Utility for showing neat toast messages instead of alerts
function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existing = document.querySelector('.toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} glass fade-in`;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.padding = '1rem 1.5rem';
  toast.style.zIndex = '1000';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.75rem';
  toast.style.fontWeight = '500';
  
  let icon = type === 'success' ? '✅' : '🔴';
  if(type === 'info') icon = 'ℹ️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
