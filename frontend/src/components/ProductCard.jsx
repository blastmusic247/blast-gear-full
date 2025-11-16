import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { addToCart, getCart } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ProductCard = ({ product, onCartUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    addToCart(product, selectedSize, quantity);
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    onCartUpdate(totalItems);
    
    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize}) x${quantity}`,
    });
    
    setIsOpen(false);
    setSelectedSize('');
    setQuantity(1);
  };

  return (
    <>
      <div 
        className="bg-card-dark rounded-lg overflow-hidden border border-soft-gray hover:border-warm-sage transition-all duration-300 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <h4 className="font-serif text-xl text-white mb-2">{product.name}</h4>
          <p className="text-warm-gray text-sm mb-4 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-serif text-warm-sage">${product.price}</span>
            <Button 
              size="sm" 
              className="bg-warm-sage hover:bg-warm-sage/90 text-black font-medium"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-card-dark border-soft-gray text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-white">{product.name}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-8 mt-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-warm-gray mb-6 leading-relaxed">{product.description}</p>
                <div className="mb-6">
                  <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Select Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full bg-dark-bg border-soft-gray text-white">
                      <SelectValue placeholder="Choose a size" />
                    </SelectTrigger>
                    <SelectContent className="bg-card-dark border-soft-gray">
                      {product.sizes.map(size => (
                        <SelectItem key={size} value={size} className="text-white hover:bg-soft-gray">{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-warm-gray uppercase tracking-wide mb-2">Quantity</label>
                  <Select value={quantity.toString()} onValueChange={(val) => setQuantity(parseInt(val))}>
                    <SelectTrigger className="w-full bg-dark-bg border-soft-gray text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card-dark border-soft-gray">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()} className="text-white hover:bg-soft-gray">{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-6 pb-6 border-t border-soft-gray pt-6">
                  <span className="text-warm-gray uppercase tracking-wide text-sm">Total</span>
                  <span className="text-3xl font-serif text-warm-sage">${(product.price * quantity).toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-warm-sage hover:bg-warm-sage/90 text-black font-medium py-6 tracking-widest uppercase"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;