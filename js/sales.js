let currentPeriod = 'daily';
let allOrders = [];
let revenueChart = null;
let itemGradesChart = null;

// The data structure to hold currently filtered and processed items
let currentItemsMap = {};

document.addEventListener('DOMContentLoaded', () => {
  allOrders = JSON.parse(localStorage.getItem('orders') || '[]'); // ✅ changed key
  
  setupBrandLogo();
  setupFilters();
  setupSearch();
  renderDashboard();
});

function setupBrandLogo() {
  const profile = JSON.parse(localStorage.getItem('smartBilling_profile') || '{}');
  const navBrandName = document.getElementById('nav-brand-name');
  const navLogo = document.getElementById('nav-logo');
  
  if (profile.businessName) navBrandName.textContent = profile.businessName;
  if (profile.logoUrl) {
    navLogo.src = profile.logoUrl;
    navLogo.style.display = 'block';
  } else {
    navLogo.style.display = 'none';
  }
}

function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      buttons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const period = e.target.getAttribute('data-period');
      currentPeriod = period;
      document.getElementById('item-search-input').value = '';
      document.getElementById('reset-search-btn').classList.remove('active');
      
      renderDashboard();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('item-search-input');
  const searchBtn = document.getElementById('item-search-btn');
  const resetBtn = document.getElementById('reset-search-btn');
  
  const performSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query !== '') {
      resetBtn.classList.add('active');
      renderItemGradesChart(query);
    } else {
      resetBtn.classList.remove('active');
      renderItemGradesChart();
    }
  };
  
  searchBtn.addEventListener('click', performSearch);
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    resetBtn.classList.remove('active');
    renderItemGradesChart();
  });
}

function getPeriodDates() {
  const now = new Date();
  
  let startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  
  let endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  
  let dateText = '';

  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay() || 7;
    if (day !== 1) date.setHours(-24 * (day - 1));
    return date;
  };
  
  if (currentPeriod === 'daily') {
    dateText = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } 
  else if (currentPeriod === 'weekly') {
    startDate = startOfWeek(now);
    startDate.setHours(0, 0, 0, 0);
    dateText = `Week of ${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}`;
  } 
  else if (currentPeriod === 'monthly') {
    startDate.setDate(1);
    dateText = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } 
  else if (currentPeriod === 'yearly') {
    startDate.setMonth(0, 1);
    dateText = now.getFullYear().toString();
  }

  return { startDate, endDate, dateText };
}

function groupDataByPeriod() {
  const { startDate, endDate, dateText } = getPeriodDates();
  
  document.getElementById('date-text').textContent = dateText;
  
  const validOrders = allOrders.filter(o => {
    const d = new Date(o.timestamp);
    return d >= startDate && d <= endDate;
  });

  let totalRevenue = 0;
  let totalItemsSold = 0;
  
  let revenueGrouping = {};
  currentItemsMap = {};

  validOrders.forEach(order => {
    totalRevenue += order.total;
    const orderDate = new Date(order.timestamp);
    
    let groupKey = '';
    
    if (currentPeriod === 'daily') {
      const hour = orderDate.getHours();
      groupKey = `${hour}:00`;
    } 
    else if (currentPeriod === 'weekly' || currentPeriod === 'monthly') {
      groupKey = orderDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } 
    else if (currentPeriod === 'yearly') {
      groupKey = orderDate.toLocaleDateString(undefined, { month: 'short' });
    }

    if (!revenueGrouping[groupKey]) {
      revenueGrouping[groupKey] = 0;
    }
    revenueGrouping[groupKey] += order.total;

    order.items.forEach(item => {
      totalItemsSold += item.quantity; // ✅ unchanged
      if (!currentItemsMap[item.name]) {
        currentItemsMap[item.name] = 0;
      }
      currentItemsMap[item.name] += item.quantity; // ✅ unchanged
    });
  });

  let finalRevenueData = fillMissingPeriods(revenueGrouping, startDate, endDate);

  return { totalRevenue, totalItemsSold, finalRevenueData };
}

function fillMissingPeriods(groupedData, startDate, endDate) {
  const result = {};
  
  if (currentPeriod === 'daily') {
    for(let i=8; i<=23; i++) {
        let key = `${i}:00`;
        result[key] = groupedData[key] || 0;
    }
  } 
  else if (currentPeriod === 'weekly') {
    let d = new Date(startDate);
    for(let i=0; i<7; i++) {
        let key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        result[key] = groupedData[key] || 0;
        d.setDate(d.getDate() + 1);
    }
  } 
  else if (currentPeriod === 'monthly') {
    let d = new Date(startDate);
    while (d <= endDate) {
        let key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        result[key] = groupedData[key] || 0;
        d.setDate(d.getDate() + 1);
    }
  } 
  else if (currentPeriod === 'yearly') {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    months.forEach(m => result[m] = groupedData[m] || 0);
  }
  
  return result;
}

function renderDashboard() {
  const contentDiv = document.getElementById('dashboard-content');
  
  if (allOrders.length === 0) {
    contentDiv.innerHTML = `
      <div class="empty-state glass">
        <h3>No Sales Data Available</h3>
        <p>Complete some orders to see your analytics here.</p>
      </div>
    `;
    return;
  }
  
  const { totalRevenue, totalItemsSold, finalRevenueData } = groupDataByPeriod();
  
  document.getElementById('total-revenue-val').textContent = `₹${totalRevenue}`;
  document.getElementById('total-items-val').textContent = totalItemsSold;
  
  renderRevenueChart(finalRevenueData);
  renderItemGradesChart();
}

function prepareSummary() {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  let totalRevenue = 0;
  let totalOrders = orders.length;
  let itemMap = {};

  orders.forEach(order => {
    totalRevenue += order.total;

    order.items.forEach(item => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = 0;
      }
      itemMap[item.name] += item.quantity;
    });
  });

  const sorted = Object.entries(itemMap).sort((a,b) => b[1] - a[1]);

  return {
    totalRevenue,
    totalOrders,
    topItems: sorted.slice(0,3).map(i => i[0]),
    worstItems: sorted.slice(-3).map(i => i[0])
  };
}

function analyzeWithAI() {
  const summary = prepareSummary();
  sendToAI(summary);
}

function renderRevenueChart(finalRevenueData) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  if (revenueChart) {
    revenueChart.destroy();
  }

  const labels = Object.keys(finalRevenueData);
  const data = Object.values(finalRevenueData);

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue (₹)',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e2e8f0' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

function renderItemGradesChart(searchQuery = '') {
  const ctx = document.getElementById('itemGradesChart');
  if (!ctx) return;

  if (itemGradesChart) {
    itemGradesChart.destroy();
  }

  let items = Object.entries(currentItemsMap).map(([name, qty]) => ({ name, qty }));

  if (searchQuery) {
    items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  items.sort((a, b) => b.qty - a.qty);

  const labels = items.map(i => i.name);
  const data = items.map(i => i.qty);

  const bgColors = data.map(qty => {
    if (qty >= 20) return 'rgba(34, 197, 94, 0.8)'; // Green - Excellent
    if (qty >= 5) return 'rgba(234, 179, 8, 0.8)'; // Yellow - Good
    return 'rgba(239, 68, 68, 0.8)'; // Red - Poor
  });

  const borderColors = data.map(qty => {
    if (qty >= 20) return 'rgb(34, 197, 94)';
    if (qty >= 5) return 'rgb(234, 179, 8)';
    return 'rgb(239, 68, 68)';
  });

  itemGradesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Items Sold',
        data: data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const qty = context.raw;
              let grade = 'Poor';
              if (qty >= 20) grade = 'Excellent';
              else if (qty >= 5) grade = 'Good';
              return `Sold: ${qty} (Grade: ${grade})`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#94a3b8', stepSize: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

async function sendToAI(summaryData) {
  try {
    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(summaryData)
    });

    const data = await res.json();

    console.log("AI Response:", data);

    alert(data.insight);
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to connect to AI backend");
  }
}