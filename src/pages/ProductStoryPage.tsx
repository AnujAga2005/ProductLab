import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ProductStoryPageProps {
  productId: string;
  onBack: () => void;
}

export const ProductStoryPage: React.FC<ProductStoryPageProps> = ({ productId, onBack }) => {
  const { getProduct, addToCart, products, isLoading } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<any>({});
  const [currentSection, setCurrentSection] = useState(0);
  const product = getProduct(productId);

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const element = section as HTMLElement;
        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;
        
        if (scrollPosition >= top && scrollPosition <= bottom) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading state while products are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl neon-text-cyan">Loading product...</h2>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    console.log('Product not found. ID:', productId);
    console.log('Available products:', products.map(p => p.id));
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
            {productId && <span className="block mt-2 text-sm">Product ID: {productId}</span>}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onBack}>Go Back</Button>
            <Button variant="outline" onClick={() => window.location.hash = 'products'}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'hero', title: 'Overview' },
    ...(product.story?.sections || []).map((section: any, index: number) => ({
      id: `section-${index}`,
      title: section.title
    })),
    { id: 'reviews', title: 'Reviews' }
  ];

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const handleAddToCart = () => {
    addToCart(product.id, 1, selectedVariant);
  };

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <motion.div
        className="fixed top-16 left-0 right-0 z-40 glass-panel border-b border-white/10"
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {product.title}
              </span>
              <Button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30 space-y-2">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className={`w-2 h-8 rounded-full transition-colors ${
              index === currentSection
                ? 'bg-gradient-to-b from-cyan-500 to-purple-500'
                : 'bg-white/20'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        data-section
        className="relative min-h-screen flex items-center pt-16"
        style={{ scale: heroScale }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Product Image */}
          <motion.div
            className="relative aspect-square glass-panel rounded-2xl overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ImageWithFallback
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            
            {/* Floating elements */}
            <motion.div
              className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Badge className="bg-cyan-500 text-white border-0">
                {product.category}
              </Badge>
            </motion.div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-cyan-400/30 text-cyan-400"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {product.title}
            </motion.h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <motion.div
              className="text-4xl neon-text-cyan"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatPrice(product.price)}
            </motion.div>

            {/* Variants */}
            {product.variants && Object.keys(product.variants).length > 0 && (
              <div className="space-y-4">
                {Object.entries(product.variants).map(([key, values]) => (
                  <div key={key}>
                    <label className="block text-sm mb-2 capitalize">
                      {key.replace('-', ' ')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(values as string[]).map((value) => (
                        <motion.button
                          key={value}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            selectedVariant[key] === value
                              ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedVariant(prev => ({ ...prev, [key]: value }))}
                        >
                          {value}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 neon-glow-cyan"
              >
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </motion.div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 hover:bg-white/10"
              >
                <Heart className="h-5 w-5 mr-2" />
                Wishlist
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 hover:bg-white/10"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-cyan-400" />
        </motion.div>
      </motion.section>

      {/* Story Sections */}
      {product.story?.sections.map((section: any, index: number) => (
        <motion.section
          key={index}
          data-section
          className="min-h-screen flex items-center py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl">{section.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </motion.div>
            
            <motion.div
              className={`relative aspect-video glass-panel rounded-2xl overflow-hidden ${
                index % 2 === 1 ? 'lg:order-1' : ''
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <ImageWithFallback
                src={section.image}
                alt={section.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.section>
      ))}

      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <motion.section
          data-section
          className="py-24 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-orange-900/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl mb-4">Customer Reviews</h2>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl">
                  {averageRating.toFixed(1)} out of 5
                </span>
                <span className="text-muted-foreground">
                  ({product.reviews.length} reviews)
                </span>
              </div>
            </motion.div>

            <div className="space-y-6">
              {product.reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  className="glass-panel rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.avatar} alt={review.user} />
                      <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4>{review.user}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Fixed Bottom CTA */}
      <motion.div
        className="fixed bottom-6 left-6 right-6 z-30"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="max-w-md mx-auto glass-panel rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Starting at</div>
              <div className="text-xl neon-text-cyan">{formatPrice(product.price)}</div>
            </div>
            <Button
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};