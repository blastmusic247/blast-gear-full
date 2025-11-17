import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, LogOut, ShoppingBag, Upload, Menu, X, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { adminGetAllProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../services/adminApi';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    sizes: [],
    category: '',
    inStock: true
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const data = await adminGetAllProducts(token);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/upload-image`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = `${BACKEND_URL}${response.data.url}`;
      setFormData({ ...formData, image: imageUrl });
      
      toast({
        title: 'Image uploaded',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSizeToggle = (size) => {
    const sizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes });
  };

  const handleCustomSizeAdd = () => {
    const customSize = prompt('Enter custom size:');
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, customSize] });
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      sizes: [],
      category: '',
      inStock: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      sizes: product.sizes,
      category: product.category,
      inStock: product.inStock
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.sizes.length === 0) {
      toast({
        title: 'Size required',
        description: 'Please select at least one size',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, productData, token);
        toast({
          title: 'Product updated',
          description: 'Product updated successfully',
        });
      } else {
        await adminCreateProduct(productData, token);
        toast({
          title: 'Product created',
          description: 'Product created successfully',
        });
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await adminDeleteProduct(productId, token);
      toast({
        title: 'Product deleted',
        description: 'Product deleted successfully',
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='min-h-screen bg-dark-bg'>
      {/* Header */}
      <nav className='bg-card-dark border-b border-soft-gray'>
        <div className='container mx-auto px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center space-x-3'>
            <img src={LOGO_URL} alt='BLAST Gear' className='h-12 w-auto' />
            <div>
              <h1 className='font-serif text-xl text-white'>BLAST Gear Admin</h1>
              <p className='text-xs text-warm-gray'>Product Management</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center space-x-4'>
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant='outline'
              className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
            >
              <ShoppingBag className='w-4 h-4 mr-2' />
              Orders
            </Button>
            <Button
              onClick={() => navigate('/admin/promo-codes')}
              variant='outline'
              className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
            >
              <Tag className='w-4 h-4 mr-2' />
              Promo Codes
            </Button>
            <a href='/' target='_blank' className='text-warm-gray hover:text-white text-sm'>
              View Store
            </a>
            <Button
              onClick={handleLogout}
              variant='outline'
              className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
            >
              <LogOut className='w-4 h-4 mr-2' />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className='lg:hidden'>
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant='outline'
              size='sm'
              className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
            >
              {isMobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className='lg:hidden bg-card-dark border-t border-soft-gray'>
            <div className='container mx-auto px-6 py-4 space-y-3'>
              <Button
                onClick={() => {
                  navigate('/admin/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                variant='outline'
                className='w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
              >
                <ShoppingBag className='w-4 h-4 mr-2' />
                Orders
              </Button>
              <Button
                onClick={() => {
                  navigate('/admin/promo-codes');
                  setIsMobileMenuOpen(false);
                }}
                variant='outline'
                className='w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
              >
                <Tag className='w-4 h-4 mr-2' />
                Promo Codes
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
                variant='outline'
                className='w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
              >
                <LogOut className='w-4 h-4 mr-2' />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className='container mx-auto px-6 py-8'>
        {/* Header */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className='font-serif text-4xl text-white mb-2'>Products</h2>
            <p className='text-warm-gray'>Manage your product catalog</p>
          </div>
          <Button
            onClick={openAddModal}
            className='bg-warm-sage hover:bg-warm-sage/90 text-black font-medium'
          >
            <Plus className='w-5 h-5 mr-2' />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className='text-center py-16 text-warm-gray'>Loading products...</div>
        ) : products.length === 0 ? (
          <div className='text-center py-16'>
            <Package className='w-16 h-16 text-warm-gray mx-auto mb-4' />
            <p className='text-warm-gray'>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {products.map((product) => (
              <div key={product.id} className='bg-card-dark rounded-lg border border-soft-gray overflow-hidden'>
                <img src={product.image} alt={product.name} className='w-full h-48 object-cover' />
                <div className='p-4'>
                  <h3 className='font-serif text-xl text-white mb-2'>{product.name}</h3>
                  <p className='text-warm-gray text-sm mb-2 line-clamp-2'>{product.description}</p>
                  <p className='text-warm-sage font-bold text-2xl mb-3'>${product.price.toFixed(2)}</p>
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {product.sizes.map(size => (
                      <span key={size} className='bg-soft-gray text-white text-xs px-2 py-1 rounded'>
                        {size}
                      </span>
                    ))}
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      size='sm'
                      onClick={() => openEditModal(product)}
                      className='flex-1 bg-soft-gray hover:bg-soft-gray/80 text-white'
                    >
                      <Edit className='w-4 h-4 mr-1' />
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      onClick={() => handleDelete(product.id)}
                      className='bg-red-600 hover:bg-red-700 text-white'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-2xl bg-card-dark border-soft-gray text-white max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-serif text-3xl text-white'>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
            <div>
              <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>Product Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='bg-dark-bg border-soft-gray text-white'
                placeholder='e.g., Classic Vintage Tee'
                required
              />
            </div>

            <div>
              <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='bg-dark-bg border-soft-gray text-white min-h-24'
                placeholder='Describe your product...'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>Price ($)</label>
                <Input
                  type='number'
                  step='0.01'
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className='bg-dark-bg border-soft-gray text-white'
                  placeholder='29.99'
                  required
                />
              </div>
              <div>
                <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className='bg-dark-bg border-soft-gray text-white'
                  placeholder='e.g., t-shirt, towel'
                  required
                />
              </div>
            </div>

            <div>
              <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>Product Image</label>
              <div className='space-y-3'>
                {formData.image && (
                  <img src={formData.image} alt='Preview' className='w-full h-48 object-cover rounded' />
                )}
                <div className='flex space-x-2'>
                  <Input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='bg-dark-bg border-soft-gray text-white'
                    disabled={uploading}
                  />
                  {uploading && <span className='text-warm-sage'>Uploading...</span>}
                </div>
                <p className='text-xs text-warm-gray'>Or enter image URL:</p>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className='bg-dark-bg border-soft-gray text-white'
                  placeholder='https://example.com/image.jpg'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm text-warm-gray uppercase tracking-wide mb-2'>Sizes</label>
              <div className='flex flex-wrap gap-2 mb-3'>
                {SHIRT_SIZES.map(size => (
                  <button
                    key={size}
                    type='button'
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded border ${
                      formData.sizes.includes(size)
                        ? 'bg-warm-sage text-black border-warm-sage'
                        : 'bg-dark-bg text-white border-soft-gray'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className='flex flex-wrap gap-2 mb-3'>
                {formData.sizes.filter(s => !SHIRT_SIZES.includes(s)).map(size => (
                  <div key={size} className='flex items-center space-x-1 px-3 py-1 bg-warm-sage text-black rounded'>
                    <span>{size}</span>
                    <button
                      type='button'
                      onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) })}
                      className='ml-1 text-black hover:text-red-600'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type='button'
                onClick={handleCustomSizeAdd}
                variant='outline'
                className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black text-sm'
              >
                + Add Custom Size
              </Button>
            </div>

            <div className='flex space-x-4 pt-4'>
              <Button
                type='button'
                onClick={() => setIsModalOpen(false)}
                variant='outline'
                className='flex-1 border-soft-gray text-white hover:bg-soft-gray'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1 bg-warm-sage hover:bg-warm-sage/90 text-black font-medium'
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
