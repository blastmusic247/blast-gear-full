import React, { useState, useEffect } from 'react';
import { ShoppingCart, Mail, MapPin, Menu, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ImageGallery from '../components/ImageGallery';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { getProducts, submitContactForm, getOrder } from '../services/api';

const RECAPTCHA_SITE_KEY = '6LfPUQYsAAAAADvrLwXHXKb1NHWvX05SR3ByfIZA';
const LOGO_URL = process.env.REACT_APP_LOGO_URL;

// Mock gallery images - used as fallback if no images in database
const mockGalleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    alt: 'T-shirt design 1'
  },
  {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    alt: 'T-shirt design 2'
  },
  {
    url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    alt: 'T-shirt design 3'
  },
  {
    url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    alt: 'T-shirt design 4'
  },
  {
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    alt: 'T-shirt design 5'
  },
  {
    url: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&q=80',
    alt: 'T-shirt design 6'
  },
  {
    url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
    alt: 'T-shirt design 7'
  },
  {
    url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80',
    alt: 'T-shirt design 8'
  }
];

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    loadGalleryImages();
    
    // Load reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA loaded');
      });
    }
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGalleryImages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gallery-images`);
      const data = await response.json();
      // If no images in database, use mock images as fallback
      setGalleryImages(data.length > 0 ? data : mockGalleryImages);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      // Use mock images as fallback
      setGalleryImages(mockGalleryImages);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    const token = window.grecaptcha?.getResponse();
    
    if (!token) {
      toast({
        title: "Verification Required",
        description: "Please complete the reCAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitContactForm({
        ...contactForm,
        recaptchaToken: token
      });

      toast({
        title: "Message Sent",
        description: "We'll get back to you within 24 hours.",
      });
      
      setContactForm({ name: '', email: '', message: '' });
      window.grecaptcha?.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTrackOrder = async () => {
    if (!trackingId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const order = await getOrder(trackingId);
      setTrackingResult(order);
      toast({
        title: "Order Found",
        description: `Status: ${order.status}`,
      });
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Order Not Found",
        description: "Please check your order ID and try again.",
        variant: "destructive",
      });
      setTrackingResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-40 border-b border-soft-gray">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src={LOGO_URL} 
                alt="BLAST Gear Logo" 
                className="h-10 md:h-14 w-auto object-contain"
              />
              <div>
                <h1 className="font-serif text-lg md:text-xl text-white">BLAST Gear</h1>
                <p className="text-xs text-warm-gray tracking-widest uppercase hidden sm:block">Bold Apparel</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#products" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">SHOP</a>
              <a href="#contact" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">CONTACT</a>
              <a href="/about" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">ABOUT US</a>
              <a href="/faq" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">FAQ</a>
              <a href="#track" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">TRACK ORDER</a>
              <a href="/admin" className="text-warm-sage hover:text-warm-sage/80 transition-colors tracking-wide text-sm font-medium">ADMIN</a>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-warm-sage transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warm-sage text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-white hover:text-warm-sage transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warm-sage text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-warm-sage transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-soft-gray pt-4">
              <a 
                href="#products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                SHOP
              </a>
              <a 
                href="#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                CONTACT
              </a>
              <a 
                href="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                ABOUT US
              </a>
              <a 
                href="/faq" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                FAQ
              </a>
              <a 
                href="#track" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                TRACK ORDER
              </a>
              <div className="border-t border-soft-gray pt-3 mt-3">
                <a 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-warm-sage hover:text-warm-sage/80 transition-colors tracking-wide text-sm py-2 font-medium"
                >
                  ADMIN LOGIN
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Free Shipping Badge */}
          <div className="inline-block mb-6 px-6 py-3 bg-warm-sage/20 border border-warm-sage rounded-full">
            <p className="text-warm-sage font-medium text-sm tracking-widest uppercase">
              ✨ Free Shipping in USA
            </p>
          </div>
          
          <h2 className="font-serif text-6xl md:text-7xl text-white mb-6 tracking-tight">
            Bold Designs,
            <br />
            <span className="text-warm-sage">Made For You</span>
          </h2>
          <p className="text-warm-gray text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover our collection of custom t-shirts featuring unique designs. Each piece is made to order and shipped with care.
          </p>
          <a href="#products">
            <Button className="bg-warm-sage hover:bg-warm-sage/90 text-black font-medium px-8 py-6 text-sm tracking-widest uppercase">
              Explore Collection
            </Button>
          </a>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-12 bg-dark-bg">
        <div className="container mx-auto">
          <ImageGallery images={galleryImages} />
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 px-6 bg-card-dark">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="font-serif text-5xl text-white mb-4">Our Collection</h3>
            <p className="text-warm-gray tracking-wide uppercase text-sm">Premium Quality · Custom Made · Free Shipping</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-warm-gray">Loading products...</div>
              </div>
            ) : (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onCartUpdate={setCartCount}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-dark-bg">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="font-serif text-4xl text-white mb-6">Get In Touch</h3>
              <p className="text-warm-gray mb-8 leading-relaxed">
                Have questions about your order or need assistance? We're here to help.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-card-dark rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-warm-sage" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-gray uppercase tracking-wide">Email</p>
                    <p className="text-white">blastgear.shop@blastmusic247.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-card-dark rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-warm-sage" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-gray uppercase tracking-wide">Location</p>
                    <p className="text-white">Orlando, FL</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Name</label>
                  <Input 
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="bg-card-dark border-soft-gray text-white focus:ring-2 focus:ring-warm-sage"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Email</label>
                  <Input 
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="bg-card-dark border-soft-gray text-white focus:ring-2 focus:ring-warm-sage"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Message</label>
                  <Textarea 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-card-dark border-soft-gray text-white focus:ring-2 focus:ring-warm-sage min-h-32"
                    required
                  />
                </div>
                <div className="flex justify-center">
                  <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY}></div>
                </div>
                <Button type="submit" className="w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium py-6 tracking-widest uppercase">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section id="track" className="py-24 px-6 bg-card-dark">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="font-serif text-4xl text-white mb-4">Track Your Order</h3>
          <p className="text-warm-gray mb-8">Enter your order ID to check the status of your shipment</p>
          <div className="bg-dark-bg p-8 rounded-lg border border-soft-gray">
            <Input 
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Order ID (e.g., ORD-1234567890)"
              className="mb-4 text-center tracking-wide bg-card-dark border-soft-gray text-white"
            />
            <Button 
              onClick={handleTrackOrder}
              className="w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium py-6 tracking-widest uppercase"
            >
              Track Order
            </Button>
            
            {trackingResult && (
              <div className="mt-6 p-6 bg-card-dark rounded-lg border border-soft-gray text-left">
                <h4 className="font-serif text-2xl text-white mb-4">Order Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Order ID:</span>
                    <span className="text-white font-medium">{trackingResult.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Status:</span>
                    <span className="text-warm-sage font-medium">{trackingResult.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-gray">Total:</span>
                    <span className="text-white font-medium">${trackingResult.total.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-soft-gray pt-3 mt-3">
                    <p className="text-sm text-warm-gray mb-2">Items:</p>
                    {trackingResult.items.map((item, index) => (
                      <div key={index} className="text-sm text-white">
                        {item.name} ({item.size}) x {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6 border-t border-soft-gray">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src={LOGO_URL} 
              alt="BLAST Gear Logo" 
              className="h-16 w-auto object-contain"
            />
            <div>
              <h4 className="font-serif text-2xl">BLAST Gear</h4>
              <p className="text-xs text-warm-gray tracking-widest uppercase">Bold Apparel</p>
            </div>
          </div>
          <p className="text-warm-gray mb-8">Premium custom t-shirts, crafted with passion</p>
          <div className="border-t border-soft-gray pt-8">
            <p className="text-sm text-warm-gray">© 2025 BLAST Gear. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCartUpdate={setCartCount} />
    </div>
  );
};

export default Home;