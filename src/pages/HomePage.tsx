import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const HomePage: React.FC = () => {
  const { products, bundles, isLoading } = useApp();
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  // Add defensive checks for data loading
  const featuredProducts = Array.isArray(products) ? products.slice(0, 6) : [];
  const featuredBundles = Array.isArray(bundles) ? bundles.slice(0, 3) : [];

  const wizardSteps = [
    {
      title: "What's your vibe?",
      options: [
        { id: 'tech', name: 'Tech Innovator', icon: '🚀', color: 'from-cyan-500 to-blue-500' },
        { id: 'wellness', name: 'Wellness Seeker', icon: '🧘', color: 'from-green-500 to-teal-500' },
        { id: 'creative', name: 'Creative Explorer', icon: '🎨', color: 'from-purple-500 to-pink-500' },
        { id: 'adventure', name: 'Adventure Ready', icon: '⚡', color: 'from-orange-500 to-red-500' }
      ]
    },
    {
      title: "When do you shop?",
      options: [
        { id: 'daily', name: 'Daily Use', icon: '☀️', color: 'from-yellow-500 to-orange-500' },
        { id: 'work', name: 'Work Hours', icon: '💼', color: 'from-blue-500 to-indigo-500' },
        { id: 'weekend', name: 'Weekend Vibes', icon: '🌙', color: 'from-indigo-500 to-purple-500' },
        { id: 'special', name: 'Special Occasions', icon: '✨', color: 'from-pink-500 to-rose-500' }
      ]
    },
    {
      title: "Your perfect match!",
      options: []
    }
  ];

  const collections = [
    {
      id: 'neural',
      title: 'Neural Interface',
      description: 'Next-gen brain-computer tech',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600',
      gradient: 'from-cyan-500 to-purple-500'
    },
    {
      id: 'quantum',
      title: 'Quantum Devices',
      description: 'Reality-bending gadgets',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'smart',
      title: 'Smart Wearables',
      description: 'Intelligence you can wear',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      gradient: 'from-green-500 to-cyan-500'
    },
    {
      id: 'plasma',
      title: 'Plasma Tech',
      description: 'Energy redefined',
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const nextWizardStep = () => {
    if (currentWizardStep < wizardSteps.length - 1) {
      setCurrentWizardStep(currentWizardStep + 1);
    }
  };

  const prevWizardStep = () => {
    if (currentWizardStep > 0) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const getRecommendedProducts = () => {
    // Simple recommendation based on selected vibe
    if (!Array.isArray(products) || products.length === 0) {
      console.log('No products available for recommendations');
      return [];
    }
    
    // Map vibes to product categories and tags
    const vibeMapping: { [key: string]: string[] } = {
      'tech': ['audio', 'wearables', 'gaming', 'smart-home', 'wireless', 'smartwatch', 'premium'],
      'wellness': ['wearables', 'smart-home', 'health', 'fitness'],
      'creative': ['audio', 'gaming', 'rgb', 'keyboard', 'premium'],
      'adventure': ['wearables', 'audio', 'fitness', 'wireless']
    };
    
    const filtered = products.filter(product => {
      if (!selectedVibe) return true;
      
      const matchTerms = vibeMapping[selectedVibe] || [];
      
      // Check if category matches any of the vibe terms
      const categoryMatch = matchTerms.includes(product.category);
      
      // Check if any tags match the vibe terms
      const tagMatch = product.tags && Array.isArray(product.tags) && 
        product.tags.some((tag: string) => matchTerms.includes(tag));
      
      return categoryMatch || tagMatch;
    });
    
    console.log(`Recommended products for vibe '${selectedVibe}':`, filtered.length, 'products');
    
    // If no matches found, return random products
    if (filtered.length === 0) {
      console.log('No matching products found, returning random products');
      return products.slice(0, 3);
    }
    
    return filtered.slice(0, 3);
  };

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
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl neon-text-cyan">Loading the future...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20" />
        <motion.div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 neon-glow-cyan">
                <Sparkles className="h-4 w-4 mr-2" />
                Future Tech Available Now
              </Badge>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Shop the Future
            </motion.h1>

            {/* Disclaimer */}
            <motion.div
              className="mb-6 max-w-2xl mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="outline" className="bg-red-500/20 dark:bg-yellow-500/10 border-red-500 dark:border-yellow-500/50 text-red-600 dark:text-yellow-500 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base inline-block text-center whitespace-normal break-words">
                ⚠️ This is a resume project and not a real ecommerce site. Don't do any payment here.
              </Badge>
            </motion.div>
            
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Discover cutting-edge products that redefine tomorrow's lifestyle. From neural interfaces to quantum devices.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 neon-glow-cyan"
                onClick={() => window.location.hash = 'products'}
              >
                <Zap className="h-5 w-5 mr-2" />
                Shop Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                onClick={() => window.location.hash = 'products'}
              >
                Explore Collections
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-20 blur-xl"
          animate={{ y: [-20, 20, -20], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"
          animate={{ y: [20, -20, 20], rotate: [360, 180, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </section>

      {/* Featured Collections */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl mb-4">Featured Collections</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Curated selections of the most innovative products across different categories
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                className="group glass-panel rounded-2xl overflow-hidden hover-lift cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => window.location.hash = 'products'}
              >
                <div className="relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-60`} />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg mb-1">{collection.title}</h3>
                    <p className="text-sm opacity-90">{collection.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guided Discovery Wizard */}
      <section className="py-24 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 dark:from-cyan-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Find Your Perfect Match
            </h2>
            <p className="text-muted-foreground text-lg">
              Let our AI guide you to products that fit your lifestyle
            </p>
          </motion.div>

          <motion.div
            className="glass-panel rounded-2xl p-8 border-2 border-cyan-500/20 dark:border-cyan-500/10"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-8">
              {wizardSteps.map((_, index) => (
                <React.Fragment key={index}>
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      index <= currentWizardStep
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white neon-glow-cyan'
                        : 'bg-muted dark:bg-white/10 text-muted-foreground'
                    }`}
                    animate={{ scale: index === currentWizardStep ? 1.2 : 1 }}
                  >
                    <span className="text-sm">{index + 1}</span>
                  </motion.div>
                  {index < wizardSteps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      index < currentWizardStep ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-muted dark:bg-white/10'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Wizard Content */}
            <div className="text-center">
              <motion.h3
                className="text-2xl mb-8"
                key={currentWizardStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {wizardSteps[currentWizardStep].title}
              </motion.h3>

              {currentWizardStep < 2 ? (
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {wizardSteps[currentWizardStep].options.map((option, index) => (
                    <motion.button
                      key={option.id}
                      className={`glass-panel rounded-xl p-4 hover:bg-cyan-500/10 dark:hover:bg-white/10 transition-colors border-2 ${
                        selectedVibe === option.id ? 'border-cyan-500 neon-glow-cyan' : 'border-transparent'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (currentWizardStep === 0) setSelectedVibe(option.id);
                        nextWizardStep();
                      }}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium">{option.name}</div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-lg text-cyan-600 dark:text-cyan-400 font-medium mb-4">
                    ✨ Based on your preferences, here are your recommendations:
                  </div>
                  {getRecommendedProducts().length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getRecommendedProducts().map((product) => (
                        <div key={product.id} className="scale-90">
                          <ProductCard 
                            product={product}
                            onViewDetails={(productId) => window.location.hash = `product/${productId}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        We're loading your personalized recommendations...
                      </p>
                      <Button
                        onClick={() => window.location.hash = 'products'}
                        variant="outline"
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                      >
                        Browse All Products
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={prevWizardStep}
                  disabled={currentWizardStep === 0}
                  className="opacity-50 hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {currentWizardStep === 2 && (
                  <Button
                    onClick={() => {
                      setCurrentWizardStep(0);
                      setSelectedVibe(null);
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                  >
                    Start Over
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-between mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl mb-4">Featured Products</h2>
              <p className="text-muted-foreground text-lg">
                Hand-picked innovative products from the future
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              onClick={() => window.location.hash = 'products'}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product}
                  onViewDetails={(productId) => window.location.hash = `product/${productId}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Drops */}
      <section className="py-24 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-orange-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl mb-4">Limited Editorial Drops</h2>
            <p className="text-muted-foreground text-lg">
              Exclusive bundles and limited-time collections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredBundles.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                className="group glass-panel rounded-2xl overflow-hidden hover-lift cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => window.location.hash = 'bundles'}
              >
                <div className="relative aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={bundle.image}
                    alt={bundle.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white border-0">
                      Limited Time
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl mb-2">{bundle.title}</h3>
                    <p className="text-sm opacity-90 mb-3">{bundle.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg">${bundle.price.toLocaleString()}</span>
                        <span className="text-sm opacity-70 line-through ml-2">
                          ${bundle.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        Save ${bundle.savings}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
