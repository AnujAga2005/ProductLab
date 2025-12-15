import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Grid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Separator } from '../components/ui/separator';

export const ProductsPage: React.FC = () => {
  const { products, searchQuery, setSearchQuery, isLoading } = useApp();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and tags
  const categories = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const cats = [...new Set(products.map(p => p.category))];
    return cats.map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: products.filter(p => p.category === cat).length
    }));
  }, [products]);

  const tags = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const allTags = products.flatMap(p => p.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.map(tag => ({
      id: tag,
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      count: products.filter(p => p.tags.includes(tag)).length
    }));
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => product.tags.includes(tag))) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
        // Mock trending sort based on review count
        filtered.sort((a, b) => b.reviews.length - a.reviews.length);
        break;
      default: // newest
        filtered.reverse();
    }

    return filtered;
  }, [products, searchQuery, selectedCategories, selectedTags, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setPriceRange([0, 5000]);
    setSearchQuery('');
  };

  const activeFiltersCount = selectedCategories.length + selectedTags.length + 
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

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
          <h2 className="text-xl neon-text-cyan">Loading products...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl mb-4">
            Discover Products
          </h1>
          <p className="text-muted-foreground text-lg">
            {filteredProducts.length} products found
          </p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          className="flex flex-col lg:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 focus:border-cyan-400"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/20 hover:bg-white/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-cyan-500 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/20">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/20">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="title">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border border-white/20 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="w-80 glass-panel rounded-xl p-6 h-fit"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg">Filters</h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        className="flex items-center space-x-2"
                        whileHover={{ x: 5 }}
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                          className="border-white/30"
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm cursor-pointer flex-1 flex justify-between"
                        >
                          <span>{category.name}</span>
                          <span className="text-muted-foreground">({category.count})</span>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10 mb-6" />

                {/* Tags */}
                <div className="mb-6">
                  <h4 className="mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <motion.button
                        key={tag.id}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name} ({tag.count})
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10 mb-6" />

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="mb-3">Price Range</h4>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={5000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div
                className="text-center py-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-xl mb-4">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard 
                      product={product} 
                      onViewDetails={(productId) => {
                        window.location.hash = `product/${productId}`;
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};