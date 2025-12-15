import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ArrowRight, ShoppingCart, Info, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const BundlesPage: React.FC = () => {
  const { bundles, products, getProduct, addToCart, isLoading } = useApp();
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Debug: Log bundles when they load
  React.useEffect(() => {
    console.log('BundlesPage - Bundles count:', bundles.length);
    console.log('BundlesPage - Products count:', products.length);
    if (bundles.length > 0) {
      console.log('BundlesPage - First bundle:', bundles[0]);
    }
  }, [bundles, products]);

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const getBundleProducts = (bundle: any) => {
    if (!bundle || !bundle.products) {
      console.log('Invalid bundle:', bundle);
      return [];
    }
    
    const products = bundle.products.map((productId: string) => {
      const product = getProduct(productId);
      if (!product) {
        console.log(`Bundle ${bundle.id} (${bundle.title}) references missing product: ${productId}`);
      }
      return product;
    }).filter(Boolean);
    
    console.log(`Bundle ${bundle.id} (${bundle.title}): ${products.length}/${bundle.products.length} products found`);
    
    return products;
  };

  const handleBuyBundle = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (bundle) {
      // Add all products in the bundle to cart
      bundle.products.forEach(productId => {
        addToCart(productId, 1);
      });
    }
  };

  const handleBundleHover = (bundleId: string | null) => {
    setExpandedBundle(bundleId);
  };

  const handleShowDetails = (bundleId: string) => {
    setSelectedBundle(bundleId);
    setShowDetails(true);
  };

  const selectedBundleData = selectedBundle ? bundles.find(b => b.id === selectedBundle) : null;
  const selectedBundleProducts = selectedBundleData ? getBundleProducts(selectedBundleData) : [];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl neon-text-pink">Loading bundles...</h2>
        </motion.div>
      </div>
    );
  }

  // Check if bundles array is empty or undefined
  if (!bundles || bundles.length === 0) {
    console.log('BundlesPage - No bundles to display. Bundles:', bundles);
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl mb-4">No Bundles Available</h2>
          <p className="text-muted-foreground mb-6">
            We're currently preparing amazing bundle deals for you. Check back soon!
          </p>
          <Button onClick={() => window.location.hash = 'products'}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }
  
  console.log('BundlesPage - Rendering bundles grid with', bundles.length, 'bundles');

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 neon-glow-purple">
              <Package className="h-4 w-4 mr-2" />
              Curated Collections
            </Badge>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Exclusive Bundles
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Carefully curated product bundles designed for specific lifestyles and needs. 
            Get more for less with our expertly crafted collections.
          </p>
        </motion.div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {bundles.map((bundle, index) => {
            const bundleProducts = getBundleProducts(bundle);
            const isExpanded = expandedBundle === bundle.id;
            
            return (
              <motion.div
                key={bundle.id}
                className="group glass-panel rounded-2xl overflow-hidden hover-lift cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => handleBundleHover(bundle.id)}
                onHoverEnd={() => handleBundleHover(null)}
                onClick={() => handleShowDetails(bundle.id)}
              >
                {/* Bundle Image */}
                <div className="relative aspect-video overflow-hidden">
                  <motion.div
                    animate={isExpanded ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ImageWithFallback
                      src={bundle.image}
                      alt={bundle.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Savings Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white border-0 neon-glow-green">
                      Save ${bundle.savings}
                    </Badge>
                  </div>

                  {/* Product Count */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
                      {bundle.products.length} items
                    </Badge>
                  </div>

                  {/* Bundle Info */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl mb-2">{bundle.title}</h3>
                    <p className="text-sm opacity-90 mb-3">{bundle.description}</p>
                    
                    {/* Tags */}
                    {bundle.tags && bundle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {bundle.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-white/30 text-white"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl neon-text-cyan">
                          {formatPrice(bundle.price)}
                        </span>
                        <span className="text-sm opacity-70 line-through ml-2">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Products Preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-white/5"
                    >
                      <h4 className="text-sm mb-3 text-muted-foreground">Includes:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {bundleProducts.slice(0, 4).map((product) => (
                          <motion.div
                            key={product.id}
                            className="flex items-center space-x-2 text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10">
                              <ImageWithFallback
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="truncate">{product.title}</span>
                          </motion.div>
                        ))}
                      </div>
                      {bundleProducts.length > 4 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +{bundleProducts.length - 4} more items
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  className="p-6 space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 neon-glow-purple"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyBundle(bundle.id);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Bundle
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-white/20 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetails(bundle.id);
                    }}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    See Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bundle Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="glass-panel border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl pr-8">
                {selectedBundleData?.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 hover:bg-white/10"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            
            {selectedBundleData && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Bundle Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={selectedBundleData.image}
                    alt={selectedBundleData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-lg">{selectedBundleData.description}</p>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="glass-panel rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl mb-1">Bundle Price</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl neon-text-cyan">
                          {formatPrice(selectedBundleData.price)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(selectedBundleData.originalPrice)}
                        </span>
                        <Badge className="bg-green-500 text-white">
                          Save ${selectedBundleData.savings}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => {
                        handleBuyBundle(selectedBundleData.id);
                        setShowDetails(false);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Buy Bundle
                    </Button>
                  </div>
                </div>

                {/* Included Products */}
                <div>
                  <h3 className="text-xl mb-4">Included Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBundleProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        className="glass-panel rounded-xl p-4 flex items-center space-x-4 hover:bg-white/10 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          window.location.hash = `product/${product.id}`;
                          setShowDetails(false);
                        }}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                          <ImageWithFallback
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-1 hover:text-cyan-400 transition-colors">{product.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <span className="text-cyan-400">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bundle Benefits */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-xl mb-4">Why Choose This Bundle?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        💰
                      </div>
                      <h4 className="mb-2">Great Savings</h4>
                      <p className="text-sm text-muted-foreground">
                        Save ${selectedBundleData.savings} compared to buying individually
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        🎯
                      </div>
                      <h4 className="mb-2">Curated Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        Expertly chosen products that work perfectly together
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        🚀
                      </div>
                      <h4 className="mb-2">Complete Solution</h4>
                      <p className="text-sm text-muted-foreground">
                        Everything you need for your specific use case
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
