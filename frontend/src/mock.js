// Mock data for t-shirt store

export const mockProducts = [
  {
    id: '1',
    name: 'Classic Vintage Tee',
    description: 'Premium cotton t-shirt with vintage-inspired design. Comfortable fit perfect for everyday wear.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'vintage',
    inStock: true
  },
  {
    id: '2',
    name: 'Minimalist Black Tee',
    description: 'Elegant black t-shirt with subtle design. Made from premium organic cotton.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'minimal',
    inStock: true
  },
  {
    id: '3',
    name: 'Artistic Expression Tee',
    description: 'Bold artistic design that makes a statement. Soft, breathable fabric.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'artistic',
    inStock: true
  },
  {
    id: '4',
    name: 'Urban Street Tee',
    description: 'Modern streetwear design with premium quality. Perfect for urban lifestyle.',
    price: 36.99,
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'streetwear',
    inStock: true
  },
  {
    id: '5',
    name: 'Nature Inspired Tee',
    description: 'Beautiful nature-themed design. Eco-friendly and sustainable materials.',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'nature',
    inStock: true
  },
  {
    id: '6',
    name: 'Geometric Pattern Tee',
    description: 'Contemporary geometric design. Unique style for the modern individual.',
    price: 37.99,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    category: 'geometric',
    inStock: true
  }
];

export const mockOrders = [];

// Helper functions for cart management using localStorage
export const getCart = () => {
  const cart = localStorage.getItem('tshirt_cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem('tshirt_cart', JSON.stringify(cart));
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
  localStorage.removeItem('tshirt_cart');
};

// Order tracking mock
export const getOrderById = (orderId) => {
  const orders = JSON.parse(localStorage.getItem('tshirt_orders') || '[]');
  return orders.find(order => order.orderId === orderId);
};

export const saveOrder = (orderData) => {
  const orders = JSON.parse(localStorage.getItem('tshirt_orders') || '[]');
  const orderId = 'ORD-' + Date.now();
  const newOrder = {
    ...orderData,
    orderId,
    status: 'Processing',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  localStorage.setItem('tshirt_orders', JSON.stringify(orders));
  return newOrder;
};