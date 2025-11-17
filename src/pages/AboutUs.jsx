import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Mail, MapPin, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;

const AboutUs = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-40 border-b border-soft-gray">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
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
              <a href="/" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">HOME</a>
              <a href="/#products" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">SHOP</a>
              <a href="/#contact" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">CONTACT</a>
              <a href="/about" className="text-warm-sage tracking-wide text-sm">ABOUT US</a>
              <a href="/faq" className="text-white hover:text-warm-sage transition-colors tracking-wide text-sm">FAQ</a>
              <a href="/admin" className="text-warm-sage hover:text-warm-sage/80 transition-colors tracking-wide text-sm font-medium">ADMIN</a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
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
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                HOME
              </a>
              <a 
                href="/#products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                SHOP
              </a>
              <a 
                href="/#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-white hover:text-warm-sage transition-colors tracking-wide text-sm py-2"
              >
                CONTACT
              </a>
              <a 
                href="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-warm-sage tracking-wide text-sm py-2"
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
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-6xl text-white mb-6">About BLAST Gear</h2>
          <p className="text-warm-sage text-xl mb-4">Bold Apparel, Custom Made</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6 bg-card-dark">
        <div className="container mx-auto max-w-4xl">
          <h3 className="font-serif text-4xl text-white mb-8 text-center">Our Story</h3>
          <div className="space-y-6 text-warm-gray text-lg leading-relaxed">
            <p>
              BLAST was founded by two lifelong friends with a 35-year bond that started in college and came full 
              circle through a shared love for music, creativity, and culture. What began as a digital platform to 
              promote independent artists worldwide has evolved into a lifestyle brand — combining media, music, and apparel.
            </p>
            <p>
              <span className="text-warm-sage font-semibold">BLAST — Bringing Life And Sound Together</span> — is all 
              about championing originality, supporting independent voices, and building community through style and sound. 
              Our apparel line reflects the same energy we give to the artists we uplift: bold, authentic, and 
              unapologetically creative.
            </p>
            <p className="text-warm-sage text-xl font-medium">
              From music to fashion, BLAST represents the culture, the movement, and the message.
            </p>
            <p className="text-white text-xl">
              Join us — and wear what you believe in.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h3 className="font-serif text-4xl text-white mb-12 text-center">What We Stand For</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card-dark p-8 rounded-lg border border-soft-gray">
              <h4 className="font-serif text-2xl text-warm-sage mb-4">Independent Voices</h4>
              <p className="text-warm-gray">
                We champion originality and support independent artists, creators, and individuals who dare to 
                be different. Your voice matters.
              </p>
            </div>
            <div className="bg-card-dark p-8 rounded-lg border border-soft-gray">
              <h4 className="font-serif text-2xl text-warm-sage mb-4">Bold & Authentic</h4>
              <p className="text-warm-gray">
                Our designs are unapologetically creative and authentic. Every piece reflects the energy, passion, 
                and culture of the movement we represent.
              </p>
            </div>
            <div className="bg-card-dark p-8 rounded-lg border border-soft-gray">
              <h4 className="font-serif text-2xl text-warm-sage mb-4">Community & Culture</h4>
              <p className="text-warm-gray">
                Building community through style and sound. We're more than apparel — we're a lifestyle that 
                connects people through shared values and creativity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist CTA Section */}
      <section className="py-16 px-6 bg-card-dark">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-warm-sage/20 to-soft-taupe/20 border-2 border-warm-sage rounded-lg p-6 md:p-12 text-center">
            <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">Independent Artists</h3>
            <p className="text-warm-gray text-base md:text-lg mb-6 md:mb-8 leading-relaxed px-2">
              Are you an independent artist seeking promotions and opportunities to share your brand? 
              We're here to amplify your voice and help you reach a global audience.
            </p>
            <p className="text-white text-lg md:text-xl font-medium mb-6 md:mb-8 px-2">
              Register for free and join our community of creators!
            </p>
            <div className="flex justify-center items-center">
              <a 
                href="https://blastmusic247.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full max-w-sm mx-auto"
              >
                <Button className="w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium px-6 md:px-10 py-4 md:py-6 text-sm md:text-base tracking-widest uppercase">
                  Register at BLAST Music 247
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6 bg-card-dark">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="font-serif text-4xl text-white mb-6">Get In Touch</h3>
          <p className="text-warm-gray text-lg mb-8">
            Have questions or want to discuss a custom order? We'd love to hear from you!
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-warm-sage" />
              <span className="text-white">blastgear.shop@blastmusic247.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-warm-sage" />
              <span className="text-white">Orlando, FL</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/#contact')}
            className="bg-warm-sage hover:bg-warm-sage/90 text-black font-medium px-8 py-6 text-sm tracking-widest uppercase"
          >
            Contact Us
          </Button>
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
    </div>
  );
};

export default AboutUs;
