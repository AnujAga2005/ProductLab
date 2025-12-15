import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  variants: any;
  story: any;
  reviews: any[];
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Add to cart with animation delay
    setTimeout(() => {
      addToCart(product.id);
      setIsAddingToCart(false);
    }, 300);
  };

  const handleViewDetails = () => {
    onViewDetails?.(product.id);
  };

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <motion.div
      className="group glass-panel rounded-xl overflow-hidden hover-lift cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, rotateX: 5, rotateY: 2 }}
      style={{ transformStyle: 'preserve-3d' }}
      onClick={handleViewDetails}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="aspect-square relative bg-white/5"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <ImageWithFallback
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          
          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className="bg-black/50 text-white border-white/20 backdrop-blur-sm"
            >
              {product.category}
            </Badge>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="absolute top-3 right-3 flex flex-col space-y-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, staggerChildren: 0.1 }}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to wishlist logic
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Quick Add to Cart Button */}
          <motion.div
            className="absolute bottom-3 left-3 right-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <motion.div
                className="flex items-center justify-center space-x-2"
                animate={isAddingToCart ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{isAddingToCart ? 'Adding...' : 'Quick Add'}</span>
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-cyan-400/30 text-cyan-400"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <motion.h3
          className="text-lg mb-2 group-hover:neon-text-cyan transition-colors"
          whileHover={{ x: 5 }}
        >
          {product.title}
        </motion.h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.reviews.length > 0 && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews.length})
            </span>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <motion.span
            className="text-xl neon-text-cyan"
            whileHover={{ scale: 1.05 }}
          >
            {formatPrice(product.price)}
          </motion.span>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              View
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={isHovered ? { boxShadow: '0 0 30px rgba(0, 245, 255, 0.3)' } : {}}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};