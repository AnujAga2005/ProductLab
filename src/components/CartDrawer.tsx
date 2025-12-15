import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, cartCount, getProduct, updateCartQuantity, removeFromCart, clearCart } = useApp();

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass-panel border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 neon-text-cyan" />
                <h2 className="text-xl">Cart</h2>
                {cartCount > 0 && (
                  <Badge className="bg-cyan-500 neon-glow-cyan">
                    {cartCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground">
                    Discover amazing products to add to your cart
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {cart.map((item, index) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;

                    return (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel rounded-lg p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex space-x-4">
                          {/* Product Image */}
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                            <ImageWithFallback
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h4 className="text-sm">{product.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {formatPrice(product.price)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-white/10"
                                  onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-white/10"
                                  onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Clear Cart Button */}
                  {cart.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: cart.length * 0.1 + 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCart}
                        className="w-full text-red-400 hover:bg-red-500/20"
                      >
                        Clear Cart
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-t border-white/10"
              >
                <div className="space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total</span>
                    <span className="text-xl neon-text-cyan">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Checkout Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 neon-glow-cyan"
                    onClick={() => {
                      // Navigate to checkout
                      window.location.hash = 'checkout';
                      onClose();
                    }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Checkout
                    </motion.span>
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};