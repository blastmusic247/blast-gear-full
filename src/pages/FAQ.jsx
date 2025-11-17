import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;

const FAQ = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className='min-h-screen bg-dark-bg'>
      {/* Navigation */}
      <nav className='fixed top-0 w-full bg-black/95 backdrop-blur-sm z-40 border-b border-soft-gray'>
        <div className='container mx-auto px-4 md:px-6 py-3 md:py-4'>
          <div className='flex justify-between items-center'>
            {/* Logo */}
            <div className='flex items-center space-x-2 md:space-x-3 cursor-pointer' onClick={() => navigate('/')}>
              <img 
                src={LOGO_URL} 
                alt='BLAST Gear Logo' 
                className='h-10 md:h-14 w-auto object-contain'
              />
              <div>
                <h1 className='font-serif text-lg md:text-xl text-white'>BLAST Gear</h1>
                <p className='text-xs text-warm-gray tracking-widest uppercase hidden sm:block'>Bold Apparel</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-8'>
              <a href='/' className='text-white hover:text-warm-sage transition-colors tracking-wide text-sm'>HOME</a>
              <a href='/#products' className='text-white hover:text-warm-sage transition-colors tracking-wide text-sm'>SHOP</a>
              <a href='/#contact' className='text-white hover:text-warm-sage transition-colors tracking-wide text-sm'>CONTACT</a>
              <a href='/about' className='text-white hover:text-warm-sage transition-colors tracking-wide text-sm'>ABOUT US</a>
              <a href='/faq' className='text-warm-sage tracking-wide text-sm'>FAQ</a>
              <a href='/admin' className='text-warm-sage hover:text-warm-sage/80 transition-colors tracking-wide text-sm font-medium'>ADMIN</a>
            </div>

            {/* Mobile Menu Button */}
            <div className='md:hidden'>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='text-white hover:text-warm-sage transition-colors'
              >
                {isMobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className='md:hidden mt-4 pb-4 space-y-3 border-t border-soft-gray pt-4'>
              <a 
                href='/' 
                onClick={() => setIsMobileMenuOpen(false)}
                className='block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2'
              >
                HOME
              </a>
              <a 
                href='/#products' 
                onClick={() => setIsMobileMenuOpen(false)}
                className='block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2'
              >
                SHOP
              </a>
              <a 
                href='/#contact' 
                onClick={() => setIsMobileMenuOpen(false)}
                className='block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2'
              >
                CONTACT
              </a>
              <a 
                href='/about' 
                onClick={() => setIsMobileMenuOpen(false)}
                className='block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2'
              >
                ABOUT US
              </a>
              <a 
                href='/faq' 
                onClick={() => setIsMobileMenuOpen(false)}
                className='block text-warm-sage tracking-wide text-sm py-2'
              >
                FAQ
              </a>
              <div className='border-t border-soft-gray pt-3 mt-3'>
                <a 
                  href='/admin' 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='block text-warm-sage hover:text-warm-sage/80 transition-colors tracking-wide text-sm py-2 font-medium'
                >
                  ADMIN LOGIN
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className='pt-32 pb-16 px-6'>
        <div className='container mx-auto max-w-4xl text-center'>
          <h2 className='font-serif text-5xl md:text-6xl text-white mb-6'>Frequently Asked Questions</h2>
          <p className='text-warm-sage text-xl mb-4'>Everything You Need to Know</p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className='py-16 px-6'>
        <div className='container mx-auto max-w-4xl'>
          {/* Refunds, Returns & Care Policy */}
          <div className='bg-card-dark rounded-lg border border-soft-gray mb-6 overflow-hidden'>
            <button
              onClick={() => toggleSection('policy')}
              className='w-full p-6 flex justify-between items-center hover:bg-soft-gray/30 transition-colors'
            >
              <h3 className='font-serif text-2xl text-warm-sage text-left'>Refunds, Returns & Care Policy</h3>
              {openSection === 'policy' ? (
                <ChevronUp className='w-6 h-6 text-warm-sage flex-shrink-0' />
              ) : (
                <ChevronDown className='w-6 h-6 text-warm-sage flex-shrink-0' />
              )}
            </button>
            
            {openSection === 'policy' && (
              <div className='px-6 pb-6 space-y-6 text-warm-gray leading-relaxed'>
                <p className='text-warm-sage font-semibold text-lg'>Please Read Before Purchasing</p>
                
                <p>
                  At BLAST, every item is custom made to order, especially for you. Because of the personalized nature of our products, <span className='text-white font-semibold'>all sales are final</span>. We do not offer refunds, returns, or exchanges once an order is placed.
                </p>

                <div>
                  <h4 className='text-white font-semibold mb-2'>Why No Returns or Exchanges?</h4>
                  <p>
                    Each shirt is pressed individually and made specifically based on the order details you provide. Once the design is transferred, it becomes a permanent part of the garment and cannot be undone or reused. For this reason, we cannot accept returns or offer size exchanges — even if the wrong size is chosen.
                  </p>
                </div>

                <div>
                  <h4 className='text-white font-semibold mb-2'>Please Double-Check Your Order</h4>
                  <p className='mb-3'>To avoid any issues:</p>
                  <ul className='list-disc list-inside space-y-2 ml-4'>
                    <li>Review your size selection carefully before finalizing your order.</li>
                    <li>Be sure of the design, color, and any customizations at the time of purchase.</li>
                    <li>If you have questions about sizing or fit, please contact us before placing your order — we're happy to help!</li>
                  </ul>
                </div>

                <div>
                  <h4 className='text-white font-semibold mb-2'>Shirt Care Instructions</h4>
                  <p className='mb-3'>
                    Our apparel is crafted with high-quality, soft-touch materials that are made to feel good and last long — but like any custom-printed item, proper care matters.
                  </p>
                  <p className='mb-2'>To maintain the softness and preserve the print quality:</p>
                  <ul className='list-disc list-inside space-y-2 ml-4'>
                    <li><span className='text-white'>Machine wash cold</span> on a regular spin cycle</li>
                    <li><span className='text-white'>Do not use bleach</span></li>
                    <li><span className='text-white'>Hang to dry</span> — avoid using a dryer, which can cause shrinking and degrade the printed design</li>
                    <li><span className='text-white'>Do not iron</span> directly on printed areas</li>
                  </ul>
                  <p className='mt-3'>
                    Following these steps helps ensure your BLAST gear stays fresh, vibrant, and wearable for years to come.
                  </p>
                </div>

                <div className='bg-dark-bg p-6 rounded border border-soft-gray'>
                  <h4 className='text-warm-sage font-semibold mb-3'>Final Note</h4>
                  <p>
                    By placing an order with BLAST, you agree to this policy and acknowledge that all purchases are final. We appreciate your understanding and support for independent creators. Our goal is to provide high-quality, meaningful products made just for you — and we take pride in delivering items that reflect the culture, creativity, and care behind our brand.
                  </p>
                  <p className='mt-4 text-warm-sage font-medium'>
                    Thank you for being a part of the movement.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shipping & Delivery */}
          <div className='bg-card-dark rounded-lg border border-soft-gray mb-6 overflow-hidden'>
            <button
              onClick={() => toggleSection('shipping')}
              className='w-full p-6 flex justify-between items-center hover:bg-soft-gray/30 transition-colors'
            >
              <h3 className='font-serif text-2xl text-warm-sage text-left'>Shipping & Delivery</h3>
              {openSection === 'shipping' ? (
                <ChevronUp className='w-6 h-6 text-warm-sage flex-shrink-0' />
              ) : (
                <ChevronDown className='w-6 h-6 text-warm-sage flex-shrink-0' />
              )}
            </button>
            
            {openSection === 'shipping' && (
              <div className='px-6 pb-6 space-y-4 text-warm-gray leading-relaxed'>
                <p>
                  All items are custom made to order and typically ship within <span className='text-white font-semibold'>5-7 business days</span> of order placement.
                </p>
                <p>
                  <span className='text-white font-semibold'>Free shipping</span> is included on all orders within the continental United States.
                </p>
                <p>
                  Once your order ships, you'll receive a tracking number via email to monitor your delivery.
                </p>
              </div>
            )}
          </div>

          {/* Order Tracking */}
          <div className='bg-card-dark rounded-lg border border-soft-gray mb-6 overflow-hidden'>
            <button
              onClick={() => toggleSection('tracking')}
              className='w-full p-6 flex justify-between items-center hover:bg-soft-gray/30 transition-colors'
            >
              <h3 className='font-serif text-2xl text-warm-sage text-left'>Order Tracking</h3>
              {openSection === 'tracking' ? (
                <ChevronUp className='w-6 h-6 text-warm-sage flex-shrink-0' />
              ) : (
                <ChevronDown className='w-6 h-6 text-warm-sage flex-shrink-0' />
              )}
            </button>
            
            {openSection === 'tracking' && (
              <div className='px-6 pb-6 space-y-4 text-warm-gray leading-relaxed'>
                <p>
                  You can track your order status at any time by visiting our <a href='/#track' className='text-warm-sage hover:underline'>Track Order</a> section on the homepage.
                </p>
                <p>
                  Simply enter your order ID (found in your confirmation email) to see the current status of your shipment.
                </p>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className='bg-card-dark rounded-lg border border-soft-gray overflow-hidden'>
            <button
              onClick={() => toggleSection('contact')}
              className='w-full p-6 flex justify-between items-center hover:bg-soft-gray/30 transition-colors'
            >
              <h3 className='font-serif text-2xl text-warm-sage text-left'>Still Have Questions?</h3>
              {openSection === 'contact' ? (
                <ChevronUp className='w-6 h-6 text-warm-sage flex-shrink-0' />
              ) : (
                <ChevronDown className='w-6 h-6 text-warm-sage flex-shrink-0' />
              )}
            </button>
            
            {openSection === 'contact' && (
              <div className='px-6 pb-6 space-y-4 text-warm-gray leading-relaxed'>
                <p>
                  If you have any questions that aren't answered here, please don't hesitate to reach out.
                </p>
                <p>
                  You can contact us through our <a href='/#contact' className='text-warm-sage hover:underline'>Contact Form</a> and we'll get back to you within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-card-dark border-t border-soft-gray py-12 px-6 mt-24'>
        <div className='container mx-auto text-center'>
          <div className='flex items-center justify-center space-x-3 mb-6'>
            <img src={LOGO_URL} alt='BLAST Gear' className='h-16 w-auto' />
            <div>
              <h3 className='font-serif text-2xl text-white'>BLAST Gear</h3>
              <p className='text-warm-gray text-sm tracking-widest uppercase'>Bold Apparel</p>
            </div>
          </div>
          <p className='text-warm-gray mb-6'>Premium custom t-shirts, crafted with passion</p>
          <div className='flex justify-center space-x-6 text-sm text-warm-gray'>
            <a href='/' className='hover:text-warm-sage transition-colors'>Home</a>
            <a href='/about' className='hover:text-warm-sage transition-colors'>About</a>
            <a href='/faq' className='hover:text-warm-sage transition-colors'>FAQ</a>
            <a href='/#contact' className='hover:text-warm-sage transition-colors'>Contact</a>
          </div>
          <p className='text-warm-gray text-sm mt-8'>
            © 2025 BLAST Gear. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
