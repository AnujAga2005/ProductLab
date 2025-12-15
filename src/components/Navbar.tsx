import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingCart, User, Menu, X, Zap, Moon, Sun, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { authAPI } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface NavbarProps {
  onCartOpen: () => void;
  onMenuToggle: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen, onMenuToggle }) => {
  const { searchQuery, setSearchQuery, cartCount, toggleDarkMode, isDarkMode, currentUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Products', href: '#products' },
    { name: 'Bundles', href: '#bundles' },
    { name: 'Discover', href: '#discover' },
  ];

  const mockSuggestions = [
    'Neural Interface',
    'Quantum Watch',
    'Smart Jacket',
    'Plasma Drone',
    'Hologram Projector'
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle(newState);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success('Logged out successfully');
      window.location.hash = 'home';
      window.location.reload(); // Reload to clear user state
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="#home"
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Zap className="h-8 w-8 neon-text-cyan" />
              <span className="text-xl tracking-tight">ProductLab</span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-foreground/80 hover:text-foreground transition-colors relative group"
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full"
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden md:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search the future..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-64 bg-white/5 border-white/20 focus:border-cyan-400 focus:neon-glow-cyan transition-all"
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-lg border border-white/10 overflow-hidden"
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Auth Links */}
              <div className="hidden lg:flex items-center space-x-2">
                {currentUser ? (
                  // Show user info and logout when logged in
                  <>
                    <motion.a
                      href="#profile"
                      className="flex items-center space-x-2 text-sm text-foreground/80 hover:text-foreground transition-colors group"
                      whileHover={{ scale: 1.05 }}
                    >
                      <User className="h-4 w-4" />
                      <span>{currentUser.username}</span>
                    </motion.a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  // Show login and signup when not logged in
                  <>
                    <motion.a
                      href="#login"
                      className="flex items-center space-x-1 text-sm text-foreground/80 hover:text-foreground transition-colors group"
                      whileHover={{ scale: 1.05 }}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </motion.a>
                    <motion.a
                      href="#signup"
                      className="flex items-center space-x-1 text-sm text-foreground/80 hover:text-foreground transition-colors group"
                      whileHover={{ scale: 1.05 }}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </motion.a>
                  </>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="hidden md:flex relative overflow-hidden"
              >
                <motion.div
                  className="flex items-center justify-center"
                  initial={false}
                  animate={{ 
                    rotate: isDarkMode ? 180 : 0,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {isDarkMode ? (
                    <Moon className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  )}
                </motion.div>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={onCartOpen}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="bg-cyan-500 hover:bg-cyan-600 neon-glow-cyan">
                      {cartCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>

              {/* Profile (only show when logged in) */}
              {currentUser && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={() => window.location.hash = 'profile'}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed top-16 right-0 bottom-0 w-64 glass-panel border-l border-white/10 z-40 md:hidden"
        >
          <div className="p-6 space-y-6">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/20"
              />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-4">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="block text-lg text-foreground/80 hover:text-foreground transition-colors"
                  whileHover={{ x: 10 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            {/* Mobile Auth Links */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              {currentUser ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.hash = 'profile';
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {currentUser.username}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.hash = 'login';
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.hash = 'signup';
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
