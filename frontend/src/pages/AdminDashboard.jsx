import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, LogOut, Edit, Trash2, DollarSign, Tag, Menu, X, Image } from 'lucide-react';
import { Button } from '../components/ui/button';
import { adminGetAllOrders, adminUpdateOrderStatus, adminRefundOrder, adminDeleteOrder } from '../services/adminApi';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const LOGO_URL = process.env.REACT_APP_LOGO_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const data = await adminGetAllOrders(token);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await adminUpdateOrderStatus(orderId, newStatus, token);
      toast({
        title: 'Status Updated',
        description: `Order ${orderId} is now ${newStatus}`,
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleRefund = async (orderId) => {
    if (!window.confirm('Are you sure you want to refund this order? This will mark the order as Refunded.')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await adminRefundOrder(orderId, token);
      toast({
        title: 'Order Refunded',
        description: `Order ${orderId} has been refunded`,
      });
      loadOrders();
    } catch (error) {
      console.error('Error refunding order:', error);
      toast({
        title: 'Error',
        description: 'Failed to refund order',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (orderId) => {
    console.log('[DELETE] Starting delete process for order:', orderId);
    
    const confirmed = window.confirm('⚠️ WARNING: Are you sure you want to DELETE this order? This action cannot be undone. Use this only for fraudulent orders.');
    console.log('[DELETE] User confirmed:', confirmed);
    
    if (!confirmed) {
      console.log('[DELETE] User cancelled deletion');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      console.log('[DELETE] Token exists:', !!token);
      console.log('[DELETE] Calling API to delete order...');
      
      const result = await adminDeleteOrder(orderId, token);
      console.log('[DELETE] API response:', result);
      
      toast({
        title: 'Order Deleted',
        description: `Order ${orderId} has been permanently deleted`,
      });
      
      console.log('[DELETE] Reloading orders list...');
      await loadOrders();
      console.log('[DELETE] Delete process complete');
    } catch (error) {
      console.error('[DELETE] Error deleting order:', error);
      console.error('[DELETE] Error details:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    refunded: orders.filter(o => o.status === 'Refunded').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
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
              <p className='text-xs text-warm-gray'>Management Panel</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center space-x-4'>
            <Button
              onClick={() => navigate('/admin/products')}
              variant='outline'
              className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
            >
              <Package className='w-4 h-4 mr-2' />
              Products
            </Button>
            <Button
              onClick={() => navigate('/admin/gallery')}
              variant='outline'
              className='border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
            >
              <Image className='w-4 h-4 mr-2' />
              Gallery
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
                  navigate('/admin/products');
                  setIsMobileMenuOpen(false);
                }}
                variant='outline'
                className='w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
              >
                <Package className='w-4 h-4 mr-2' />
                Products
              </Button>
              <Button
                onClick={() => {
                  navigate('/admin/gallery');
                  setIsMobileMenuOpen(false);
                }}
                variant='outline'
                className='w-full justify-start border-warm-sage text-warm-sage hover:bg-warm-sage hover:text-black'
              >
                <Image className='w-4 h-4 mr-2' />
                Gallery
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
        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
          <div className='bg-card-dark p-6 rounded-lg border border-soft-gray'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-warm-gray text-sm uppercase'>Total Orders</p>
                <p className='text-3xl font-serif text-white mt-2'>{stats.total}</p>
              </div>
              <Package className='w-10 h-10 text-warm-sage' />
            </div>
          </div>
          <div className='bg-card-dark p-6 rounded-lg border border-soft-gray'>
            <p className='text-warm-gray text-sm uppercase'>Processing</p>
            <p className='text-3xl font-serif text-yellow-500 mt-2'>{stats.processing}</p>
          </div>
          <div className='bg-card-dark p-6 rounded-lg border border-soft-gray'>
            <p className='text-warm-gray text-sm uppercase'>Shipped</p>
            <p className='text-3xl font-serif text-blue-500 mt-2'>{stats.shipped}</p>
          </div>
          <div className='bg-card-dark p-6 rounded-lg border border-soft-gray'>
            <p className='text-warm-gray text-sm uppercase'>Delivered</p>
            <p className='text-3xl font-serif text-green-500 mt-2'>{stats.delivered}</p>
          </div>
          <div className='bg-card-dark p-6 rounded-lg border border-soft-gray'>
            <p className='text-warm-gray text-sm uppercase'>Revenue</p>
            <p className='text-3xl font-serif text-warm-sage mt-2'>${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className='bg-card-dark rounded-lg border border-soft-gray'>
          <div className='p-6 border-b border-soft-gray'>
            <h2 className='font-serif text-2xl text-white'>Recent Orders</h2>
          </div>
          
          {loading ? (
            <div className='p-8 text-center text-warm-gray'>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className='p-8 text-center text-warm-gray'>No orders yet</div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-soft-gray text-white'>
                  <tr>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Order ID</th>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Customer</th>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Items</th>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Total</th>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Status</th>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Date</th>
                    <th className='px-6 py-4 text-left text-sm font-medium'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className='border-b border-soft-gray hover:bg-soft-gray/30'>
                      <td className='px-6 py-4 text-warm-sage font-mono text-sm'>{order.orderId}</td>
                      <td className='px-6 py-4'>
                        <div className='text-white text-sm'>{order.customer.firstName} {order.customer.lastName}</div>
                        <div className='text-warm-gray text-xs'>{order.customer.email}</div>
                      </td>
                      <td className='px-6 py-4 text-white text-sm'>{order.items.length} item(s)</td>
                      <td className='px-6 py-4 text-white font-medium'>${order.total.toFixed(2)}</td>
                      <td className='px-6 py-4'>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.orderId, value)}
                        >
                          <SelectTrigger className='w-32 bg-dark-bg border-soft-gray text-white'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className='bg-card-dark border-soft-gray'>
                            <SelectItem value='Processing' className='text-white hover:bg-soft-gray'>Processing</SelectItem>
                            <SelectItem value='Shipped' className='text-white hover:bg-soft-gray'>Shipped</SelectItem>
                            <SelectItem value='Delivered' className='text-white hover:bg-soft-gray'>Delivered</SelectItem>
                            <SelectItem value='Cancelled' className='text-white hover:bg-soft-gray'>Cancelled</SelectItem>
                            <SelectItem value='Refunded' className='text-white hover:bg-soft-gray'>Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className='px-6 py-4 text-warm-gray text-sm'>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex space-x-2'>
                          <Button
                            size='sm'
                            onClick={() => setSelectedOrder(order)}
                            className='bg-warm-sage hover:bg-warm-sage/90 text-black'
                          >
                            <Edit className='w-4 h-4 mr-1' />
                            View
                          </Button>
                          {order.status !== 'Refunded' && (
                            <Button
                              size='sm'
                              onClick={() => handleRefund(order.orderId)}
                              className='bg-orange-600 hover:bg-orange-700 text-white'
                            >
                              <DollarSign className='w-4 h-4 mr-1' />
                              Refund
                            </Button>
                          )}
                          <Button
                            size='sm'
                            onClick={() => handleDelete(order.orderId)}
                            className='bg-red-600 hover:bg-red-700 text-white'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6' onClick={() => setSelectedOrder(null)}>
          <div className='bg-card-dark rounded-lg border border-soft-gray max-w-3xl w-full max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            <div className='p-6 border-b border-soft-gray flex justify-between items-center'>
              <h3 className='font-serif text-2xl text-white'>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className='text-warm-gray hover:text-white'>✕</button>
            </div>
            <div className='p-6 space-y-6'>
              <div>
                <h4 className='text-warm-sage font-medium mb-2'>Order Information</h4>
                <div className='bg-dark-bg p-4 rounded space-y-2'>
                  <p className='text-white'><span className='text-warm-gray'>Order ID:</span> {selectedOrder.orderId}</p>
                  <p className='text-white'><span className='text-warm-gray'>Status:</span> {selectedOrder.status}</p>
                  <p className='text-white'><span className='text-warm-gray'>Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className='text-warm-sage font-medium mb-2'>Customer Details</h4>
                <div className='bg-dark-bg p-4 rounded space-y-2'>
                  <p className='text-white'>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                  <p className='text-warm-gray'>{selectedOrder.customer.email}</p>
                  <p className='text-warm-gray'>{selectedOrder.customer.phone}</p>
                </div>
              </div>

              <div>
                <h4 className='text-warm-sage font-medium mb-2'>Shipping Address</h4>
                <div className='bg-dark-bg p-4 rounded'>
                  <p className='text-white'>{selectedOrder.customer.address}</p>
                  <p className='text-white'>{selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zipCode}</p>
                  <p className='text-white'>{selectedOrder.customer.country}</p>
                </div>
              </div>

              <div>
                <h4 className='text-warm-sage font-medium mb-2'>Order Items</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className='bg-dark-bg p-4 rounded mb-2 flex items-center space-x-4'>
                    <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded' />
                    <div className='flex-1'>
                      <p className='text-white font-medium'>{item.name}</p>
                      <p className='text-warm-gray text-sm'>Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <p className='text-white font-medium'>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className='text-warm-sage font-medium mb-2'>Order Summary</h4>
                <div className='bg-dark-bg p-4 rounded space-y-2'>
                  <div className='flex justify-between text-white'>
                    <span className='text-warm-gray'>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-white'>
                    <span className='text-warm-gray'>Shipping:</span>
                    <span>${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-white'>
                    <span className='text-warm-gray'>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className='border-t border-soft-gray pt-2 flex justify-between text-white font-bold text-lg'>
                    <span>Total:</span>
                    <span className='text-warm-sage'>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
