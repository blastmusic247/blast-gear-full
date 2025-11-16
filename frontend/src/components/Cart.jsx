import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { getCart, removeFromCart, updateCartQuantity } from '../services/api';

const Cart = ({ isOpen, onClose, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const cart = getCart();
      setCartItems(cart);
    }
  }, [isOpen]);

  const handleRemove = (cartId) => {
    const updatedCart = removeFromCart(cartId);
    setCartItems(updatedCart);
    const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    onCartUpdate(totalItems);
  };

  const handleUpdateQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = updateCartQuantity(cartId, newQuantity);
    setCartItems(updatedCart);
    const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    onCartUpdate(totalItems);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-card-dark z-50 shadow-2xl flex flex-col border-l border-soft-gray">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-soft-gray">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6 text-warm-sage" />
            <h3 className="font-serif text-2xl text-white">Shopping Cart</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-warm-gray hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-soft-gray mx-auto mb-4" />
              <p className="text-warm-gray">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map(item => (
                <div key={item.cartId} className="flex space-x-4 pb-6 border-b border-soft-gray">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-serif text-lg text-white mb-1">{item.name}</h4>
                    <p className="text-sm text-warm-gray mb-2">Size: {item.size}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}
                          className="w-8 h-8 bg-soft-gray rounded flex items-center justify-center hover:bg-warm-sage hover:text-black transition-colors text-white"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                          className="w-8 h-8 bg-soft-gray rounded flex items-center justify-center hover:bg-warm-sage hover:text-black transition-colors text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-lg text-warm-sage">${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          onClick={() => handleRemove(item.cartId)}
                          className="text-xs text-warm-gray hover:text-red-500 transition-colors uppercase tracking-wide"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-soft-gray p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-warm-gray uppercase tracking-wide text-sm">Subtotal</span>
              <span className="font-serif text-2xl text-white">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-warm-gray text-center">Shipping calculated at checkout</p>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium py-6 tracking-widest uppercase"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;