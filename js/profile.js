document.addEventListener('DOMContentLoaded', () => {
  loadProfileData();
});

function loadProfileData() {
  const brandNameObj = localStorage.getItem('smartBilling_brandName');
  const brandLogoObj = localStorage.getItem('smartBilling_brandLogo');

  const defaultName = "SmartFlow SaaS";
  const defaultLogo = "https://images.unsplash.com/photo-1550592704-6c7baba442ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80";

  const bName = brandNameObj ? brandNameObj : defaultName;
  const bLogo = brandLogoObj ? brandLogoObj : defaultLogo;

  document.getElementById('brandName').value = bName;
  document.getElementById('brandLogo').value = bLogo;
  document.getElementById('logoPreview').src = bLogo;
}

function updatePreview() {
  const url = document.getElementById('brandLogo').value;
  if(url) {
    document.getElementById('logoPreview').src = url;
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Str = e.target.result;
      document.getElementById('brandLogo').value = base64Str;
      document.getElementById('logoPreview').src = base64Str;
    };
    reader.readAsDataURL(file);
  }
}

function saveSettings() {
  const newName = document.getElementById('brandName').value.trim();
  const newLogo = document.getElementById('brandLogo').value.trim();

  if(!newName) {
    showToast('Brand Name cannot be empty', 'error');
    return;
  }

  localStorage.setItem('smartBilling_brandName', newName);
  
  if(newLogo) {
    localStorage.setItem('smartBilling_brandLogo', newLogo);
  }

  showToast('Settings Saved successfully', 'success');

  // Immediately update navbar items globally through app.js function
  initBrandSettings();
}
