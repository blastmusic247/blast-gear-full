import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { adminLogin } from '../services/adminApi';
import { useToast } from '../hooks/use-toast';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;
const HCAPTCHA_SITE_KEY = "b220bebc-2484-4066-8238-ac40f7be4e32";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);

  useEffect(() => {
    // If already logged in, skip login page
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        title: "Security Check Required",
        description: "Please complete the hCaptcha challenge.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Send username, password, and hCaptcha token to backend
      const response = await adminLogin(
        credentials.username,
        credentials.password,
        captchaToken
      );

      localStorage.setItem('admin_token', response.access_token);

      toast({
        title: 'Login Successful',
        description: 'Welcome to BLAST Gear Admin Panel'
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Invalid credentials. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Incorrect username or password.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      // Reset hCaptcha on failure
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    } finally {
      setLoading(false);
      setCaptchaToken(""); // reset token
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
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
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
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className='bg-dark-bg border-soft-gray text-white'
                placeholder='••••••••'
                required
              />
            </div>

            {/* --- HCAPTCHA LOGIN SECURITY --- */}
            <div className="flex justify-center pt-2">
              <HCaptcha
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                ref={captchaRef}
              />
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
