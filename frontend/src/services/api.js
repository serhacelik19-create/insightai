const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('onboarding_complete');
      window.dispatchEvent(new Event('auth-error'));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Bir hata oluştu');
  }
  return response.json();
};

export const api = {
  // Auth
  register: (email, password, businessName, businessType) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password, business_name: businessName, business_type: businessType })
    }).then(handleResponse),

  login: (email, password) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password })
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/api/auth/me`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Profile
  getProfile: () =>
    fetch(`${API_BASE}/api/profile`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  updateProfile: (businessName, businessType) =>
    fetch(`${API_BASE}/api/profile`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ business_name: businessName, business_type: businessType })
    }).then(handleResponse),

  updateCredentials: (email, password) =>
    fetch(`${API_BASE}/api/profile/credentials`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email: email || null, password: password || null })
    }).then(handleResponse),

  // Financial & Product Data
  getData: () =>
    fetch(`${API_BASE}/api/data`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  uploadFile: (formData) =>
    fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: formData
    }).then(handleResponse),

  // Manual Data Entry (JSON API)
  createFinancialRecord: (record) =>
    fetch(`${API_BASE}/api/data/record`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(record)
    }).then(handleResponse),

  deleteFinancialRecord: (recordId) =>
    fetch(`${API_BASE}/api/data/record/${recordId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  createProduct: (product) =>
    fetch(`${API_BASE}/api/data/product`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(product)
    }).then(handleResponse),

  deleteProduct: (productId) =>
    fetch(`${API_BASE}/api/data/product/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Analysis & AI
  analyze: (force = false) =>
    fetch(`${API_BASE}/api/analyze?force=${force}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Chat
  getChatHistory: () =>
    fetch(`${API_BASE}/api/chat/history`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  sendChatMessage: (message, systemPrompt = '') =>
    fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ message, system_prompt: systemPrompt })
    }).then(handleResponse),

  clearChat: () =>
    fetch(`${API_BASE}/api/chat/clear`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Personnel
  getPersonnel: () =>
    fetch(`${API_BASE}/api/personnel`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  createPersonnel: (personnel) =>
    fetch(`${API_BASE}/api/personnel`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(personnel)
    }).then(handleResponse),

  deletePersonnel: (personnelId) =>
    fetch(`${API_BASE}/api/personnel/${personnelId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Menu
  getMenu: () =>
    fetch(`${API_BASE}/api/menu`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  createMenu: (menuItem) =>
    fetch(`${API_BASE}/api/menu`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(menuItem)
    }).then(handleResponse),

  deleteMenu: (menuId) =>
    fetch(`${API_BASE}/api/menu/${menuId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  // Scenarios
  createScenario: (scenario) =>
    fetch(`${API_BASE}/api/scenario`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(scenario)
    }).then(handleResponse),

  // Benchmarks & Health
  getHealthScore: () =>
    fetch(`${API_BASE}/api/health`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  getBenchmark: (businessType) =>
    fetch(`${API_BASE}/api/benchmark/${businessType}`, {
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse),

  loadDemoData: () =>
    fetch(`${API_BASE}/api/demo`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    }).then(handleResponse)
};
