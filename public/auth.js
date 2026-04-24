/**
 * Auth utilities for Admin pages (plain JS)
 */

function getToken() {
  return localStorage.getItem('adminToken');
}

function getAdminId() {
  return localStorage.getItem('adminId');
}

function isAdmin() {
  return !!getToken();
}

function loginAdmin(token, adminId) {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminId', adminId);
}

function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminId');
  window.location.href = 'Index.html';
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {};
}

