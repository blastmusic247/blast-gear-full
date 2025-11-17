import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Admin Auth
export const adminLogin = async (username, password, recaptchaToken) => {
  const response = await axios.post(`${API}/admin/login`, {
    username,
    password,
    recaptchaToken
  });
  return response.data;
};

// Admin Orders
export const adminGetAllOrders = async (token) => {
  const response = await axios.get(`${API}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminGetOrder = async (orderId, token) => {
  const response = await axios.get(`${API}/admin/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminUpdateOrderStatus = async (orderId, status, token) => {
  const response = await axios.put(
    `${API}/admin/orders/${orderId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const adminRefundOrder = async (orderId, token) => {
  const response = await axios.post(
    `${API}/admin/orders/${orderId}/refund`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const adminDeleteOrder = async (orderId, token) => {
  const response = await axios.delete(
    `${API}/admin/orders/${orderId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Admin Products
export const adminGetAllProducts = async (token) => {
  const response = await axios.get(`${API}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminCreateProduct = async (productData, token) => {
  const response = await axios.post(`${API}/admin/products`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminUpdateProduct = async (productId, productData, token) => {
  const response = await axios.put(`${API}/admin/products/${productId}`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminDeleteProduct = async (productId, token) => {
  const response = await axios.delete(`${API}/admin/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Promo Codes
export const adminGetAllPromoCodes = async (token) => {
  const response = await axios.get(`${API}/admin/promo-codes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminCreatePromoCode = async (promoData, token) => {
  const response = await axios.post(`${API}/admin/promo-codes`, promoData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminDeletePromoCode = async (promoId, token) => {
  const response = await axios.delete(`${API}/admin/promo-codes/${promoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const validatePromoCode = async (code, orderTotal) => {
  const response = await axios.post(`${API}/validate-promo`, {
    code,
    orderTotal
  });
  return response.data;
};

export const applyPromoCode = async (code) => {
  const response = await axios.post(`${API}/apply-promo/${code}`);
  return response.data;
};
