import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Products API
export const getProducts = async () => {
  const response = await axios.get(`${API}/products`);
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await axios.get(`${API}/products/${productId}`);
  return response.data;
};

// Orders API
export const createOrder = async (orderData) => {
  const response = await axios.post(`${API}/orders`, orderData);
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await axios.get(`${API}/orders/${orderId}`);
  return response.data;
};

// Contact API
export const submitContactForm = async (formData) => {
  const response = await axios.post(`${API}/contact`, formData);
  return response.data;
};

// Cart management (stays in localStorage)
export const getCart = () => {
  const cart = localStorage.getItem('blast_gear_cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem('blast_gear_cart', JSON.stringify(cart));
};

export const addToCart = (product, size, quantity) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id && item.size === size);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      size,
      quantity,
      cartId: Date.now() + Math.random()
    });
  }
  
  saveCart(cart);
  return cart;
};

export const removeFromCart = (cartId) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.cartId !== cartId);
  saveCart(updatedCart);
  return updatedCart;
};

export const updateCartQuantity = (cartId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.cartId === cartId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
  }
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem('blast_gear_cart');
};
