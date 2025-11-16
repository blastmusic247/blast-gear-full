import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { adminLogin } from '../services/adminApi';
import { useToast } from '../hooks/use-toast';

const RECAPTCHA_SITE_KEY = '6LfPUQYsAAAAADvrLwXHXKb1NHWvX05SR3ByfIZA';
const LOGO_URL = process.env.REACT_APP_LOGO_URL;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }

    // Load reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA loaded');
      });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get reCAPTCHA token (send dummy token if reCAPTCHA not loaded)
    let token = 'development-bypass';
    try {
      token = window.grecaptcha?.getResponse() || 'development-bypass';
    } catch (error) {
      console.log('reCAPTCHA not available, using bypass token');
    }

    setLoading(true);

    try {
      const response = await adminLogin(credentials.username, credentials.password, token);
      localStorage.setItem('admin_token', response.access_token);
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to BLAST Gear Admin Panel',
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Determine error message
      let errorMessage = 'Invalid credentials. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Incorrect username or password. Please check your credentials.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || 'Login failed. Please verify your information.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (window.grecaptcha) {
        try {
          window.grecaptcha?.reset();
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-dark-bg flex items-center justify-center px-6'>
      <div className='max-w-md w-full'>
        <div className='text-center mb-8'>
          <img 
            src={LOGO_URL} 
            alt='BLAST Gear Logo' 
            className='h-20 w-auto object-contain mx-auto mb-4'
          />
          <h1 className='font-serif text-4xl text-white mb-2'>Admin Panel</h1>
          <p className='text-warm-gray'>BLAST Gear Management</p>
        </div>

        <div className='bg-card-dark p-8 rounded-lg border border-soft-gray'>
          <div className='flex items-center space-x-2 mb-6'>
            <LogIn className='w-6 h-6 text-warm-sage' />
            <h2 className='font-serif text-2xl text-white'>Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>
                Username
              </label>
              <Input
                type='text'
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className='bg-dark-bg border-soft-gray text-white'
                placeholder='admin'
                required
              />
            </div>

            <div>
              <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>
                Password
              </label>
              <Input
                type='password'
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className='bg-dark-bg border-soft-gray text-white'
                placeholder='••••••••'
                required
              />
            </div>

            <div className='flex justify-center'>
              <div className='g-recaptcha' data-sitekey={RECAPTCHA_SITE_KEY}></div>
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium py-6 tracking-widest uppercase'
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className='text-center mt-6'>
          <a href='/' className='text-warm-sage hover:text-warm-sage/80 text-sm'>
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
