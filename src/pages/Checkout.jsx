import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Package } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getCart, clearCart, createOrder } from '../services/api';
import { validatePromoCode, applyPromoCode } from '../services/adminApi';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const STRIPE_PUBLIC_KEY = 'pk_test_51PO5c5Fd5DG2TAfXY74R4IXlBuqY2WPYabOBXFO2S6reAwdrK9y5wQe3tEFRbU2WvOBMRBRoqmpBeerUkpiwv08D00g77ObNYW';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  
  const [cartItems, setCartItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      navigate('/');
    } else {
      setCartItems(cart);
    }
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 8.99;
  const tax = subtotal * 0.08;
  const discount = promoApplied ? promoApplied.discountAmount : 0;
  const total = subtotal + shipping + tax - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    try {
      const result = await validatePromoCode(promoCode, subtotal + shipping + tax);
      setPromoApplied(result);
      setPromoError('');
      toast({
        title: 'Promo Code Applied',
        description: `You saved $${result.discountAmount.toFixed(2)}!`,
      });
    } catch (error) {
      setPromoError(error.response?.data?.detail || 'Invalid promo code');
      setPromoApplied(null);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(null);
    setPromoError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const paymentIntentResponse = await axios.post(`${BACKEND_URL}/api/create-payment-intent`, {
        amount: total,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      const { clientSecret } = paymentIntentResponse.data;

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
              country: 'US'
            }
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Apply promo code usage if present
        if (promoApplied) {
          try {
            await applyPromoCode(promoApplied.code);
          } catch (error) {
            console.error('Error applying promo code usage:', error);
          }
        }

        // Save order to database
        const order = await createOrder({
          customer: formData,
          items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            size: item.size,
            quantity: item.quantity,
            image: item.image
          })),
          subtotal,
          shipping,
          tax,
          total,
          promoCode: promoApplied ? promoApplied.code : null,
          discount: promoApplied ? promoApplied.discountAmount : 0
        });

        // Clear cart
        clearCart();

        toast({
          title: "Order Placed Successfully!",
          description: `Your order ID is ${order.orderId}. Check your email for confirmation.`,
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-warm-gray hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="tracking-wide uppercase text-sm">Back to Shop</span>
        </button>

        <h1 className="font-serif text-5xl text-white mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-card-dark rounded-lg p-8 shadow-sm border border-soft-gray">
                <div className="flex items-center space-x-3 mb-6">
                  <Package className="w-6 h-6 text-warm-sage" />
                  <h2 className="font-serif text-2xl text-white">Shipping Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">First Name</label>
                    <Input 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Last Name</label>
                    <Input 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Email</label>
                    <Input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Phone</label>
                    <Input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Address</label>
                    <Input 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">City</label>
                    <Input 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">State</label>
                    <Input 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Zip Code</label>
                    <Input 
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Country</label>
                    <Input 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="bg-dark-bg border-soft-gray text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-card-dark rounded-lg p-8 shadow-sm border border-soft-gray">
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="w-6 h-6 text-warm-sage" />
                  <h2 className="font-serif text-2xl text-white">Payment Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Card Details</label>
                    <div className="bg-dark-bg border border-soft-gray rounded-md p-4">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#ffffff',
                              '::placeholder': {
                                color: '#9ca3af',
                              },
                            },
                            invalid: {
                              color: '#ef4444',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium py-6 tracking-widest uppercase text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card-dark rounded-lg p-8 shadow-sm sticky top-24 border border-soft-gray">
              <h2 className="font-serif text-2xl text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.cartId} className="flex justify-between text-sm">
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-warm-gray">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-soft-gray pt-6 space-y-3">
                {/* Promo Code Section */}
                <div className="mb-4 pb-4 border-b border-soft-gray">
                  <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Promo Code</label>
                  {!promoApplied ? (
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="bg-dark-bg border-soft-gray text-white uppercase"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-warm-sage hover:bg-warm-sage/90 text-black whitespace-nowrap"
                      >
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-900/30 border border-green-600 rounded p-3">
                      <div>
                        <p className="text-green-400 font-medium">{promoApplied.code} Applied!</p>
                        <p className="text-xs text-warm-gray">{promoApplied.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Shipping</span>
                  <span className="text-white">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount ({promoApplied.discountType === 'percentage' ? `${promoApplied.discountValue}%` : `$${promoApplied.discountValue}`})</span>
                    <span className="text-green-400">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-soft-gray pt-3 flex justify-between">
                  <span className="text-white font-medium uppercase tracking-wide">Total</span>
                  <span className="font-serif text-2xl text-warm-sage">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;