import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, Trash2, LogOut, ShoppingBag, Package, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { adminGetAllPromoCodes, adminCreatePromoCode, adminDeletePromoCode } from '../services/adminApi';
import { useToast } from '../hooks/use-toast';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;

const AdminPromoCodes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    description: '',
    expiryDate: '',
    usageLimit: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadPromoCodes();
  }, [navigate]);

  const loadPromoCodes = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const data = await adminGetAllPromoCodes(token);
      setPromoCodes(data);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const openAddModal = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      description: '',
      expiryDate: '',
      usageLimit: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('admin_token');
      const promoData = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        description: formData.description,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      await adminCreatePromoCode(promoData, token);
      toast({
        title: 'Promo Code Created',
        description: `Code ${promoData.code} created successfully`,
      });

      setIsModalOpen(false);
      loadPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create promo code',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (promoId, code) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      await adminDeletePromoCode(promoId, token);
      toast({
        title: 'Promo Code Deleted',
        description: `Code ${code} deleted successfully`,
      });
      loadPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promo code',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="bg-card-dark border-b border-soft-gray">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={LOGO_URL} alt="BLAST Gear" className="h-12 w-auto" />
            <div>
              <h1 className="font-serif text-xl text-white">BLAST Gear Admin</h1>
              <p className="text-xs text-warm-gray">Promo Code Management</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant="outline"
              className="border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <Button
              onClick={() => navigate('/admin/products')}
              variant="outline"
              className="border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Button>
            <a href='/' target='_blank' className='text-warm-gray hover:text-white text-sm'>
              View Store
            </a>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="outline"
              size="sm"
              className="border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card-dark border-t border-soft-gray">
            <div className="container mx-auto px-6 py-4 space-y-3">
              <Button
                onClick={() => {
                  navigate('/admin/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
              </Button>
              <Button
                onClick={() => {
                  navigate('/admin/products');
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </Button>
              <a 
                href='/' 
                target='_blank' 
                className='block text-warm-gray hover:text-white text-sm py-2 px-3 rounded border border-warm-sage hover:bg-warm-sage hover:text-black transition-colors'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                View Store
              </a>
              <Button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-serif text-4xl text-white mb-2">Promo Codes</h2>
            <p className="text-warm-gray">Create discount codes for employees, family, and customers</p>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-warm-sage hover:bg-warm-sage/90 text-black font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Promo Code
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-warm-gray">Loading promo codes...</div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-warm-gray mx-auto mb-4" />
            <p className="text-warm-gray">No promo codes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="bg-card-dark rounded-lg border border-soft-gray overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Value</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Usage</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Expires</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="border-b border-soft-gray">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-warm-sage font-bold">{promo.code}</p>
                        <p className="text-xs text-warm-gray">{promo.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white capitalize">{promo.discountType}</td>
                    <td className="px-6 py-4 text-white font-medium">
                      {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : '/ ∞'}
                    </td>
                    <td className="px-6 py-4 text-warm-gray text-sm">
                      {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs ${promo.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        onClick={() => handleDelete(promo.id, promo.code)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Promo Code Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg bg-card-dark border-soft-gray text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-white">Create Promo Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="bg-dark-bg border-soft-gray text-white uppercase"
                placeholder="FAMILY20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Type</label>
                <Select value={formData.discountType} onValueChange={(val) => setFormData({ ...formData, discountType: val })}>
                  <SelectTrigger className="bg-dark-bg border-soft-gray text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-soft-gray">
                    <SelectItem value="percentage" className="text-white">Percentage</SelectItem>
                    <SelectItem value="fixed" className="text-white">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Value</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="bg-dark-bg border-soft-gray text-white"
                  placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Description (Optional)</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-dark-bg border-soft-gray text-white"
                placeholder="For family members"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Expiry Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="bg-dark-bg border-soft-gray text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Usage Limit (Optional)</label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="bg-dark-bg border-soft-gray text-white"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="flex-1 border-soft-gray text-white hover:bg-soft-gray"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-warm-sage hover:bg-warm-sage/90 text-black font-medium"
              >
                Create Code
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromoCodes;
