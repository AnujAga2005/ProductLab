import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider } from './contexts/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductStoryPage } from './pages/ProductStoryPage';
import { BundlesPage } from './pages/BundlesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DebugPage } from './pages/DebugPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import UpiVerifyPage from './pages/UpiVerifyPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

type PageType = 'home' | 'products' | 'bundles' | 'product-story' | 'discover' | 'profile' | 'checkout' | 'checkout-success' | 'upi-verify' | 'login' | 'signup' | 'debug' | '404';

interface AppState {
  currentPage: PageType;
  selectedProductId?: string;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'home',
    isCartOpen: false,
    isMobileMenuOpen: false,
  });

  // Simple client-side routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const [page, productId] = hash.split('/');
      
      switch (page) {
        case 'products':
          setAppState(prev => ({ ...prev, currentPage: 'products' }));
          break;
        case 'bundles':
          setAppState(prev => ({ ...prev, currentPage: 'bundles' }));
          break;
        case 'product':
          if (productId) {
            setAppState(prev => ({ 
              ...prev, 
              currentPage: 'product-story', 
              selectedProductId: productId 
            }));
          }
          break;
        case 'discover':
          setAppState(prev => ({ ...prev, currentPage: 'discover' }));
          break;
        case 'profile':
          setAppState(prev => ({ ...prev, currentPage: 'profile' }));
          break;
        case 'checkout':
          setAppState(prev => ({ ...prev, currentPage: 'checkout' }));
          break;
        case 'checkout-success':
          setAppState(prev => ({ ...prev, currentPage: 'checkout-success' }));
          break;
        case 'upi-verify':
          setAppState(prev => ({ ...prev, currentPage: 'upi-verify' }));
          break;
        case 'login':
          setAppState(prev => ({ ...prev, currentPage: 'login' }));
          break;
        case 'signup':
          setAppState(prev => ({ ...prev, currentPage: 'signup' }));
          break;
        case 'debug':
          setAppState(prev => ({ ...prev, currentPage: 'debug' }));
          break;
        case '':
        case 'home':
          setAppState(prev => ({ ...prev, currentPage: 'home' }));
          break;
        default:
          setAppState(prev => ({ ...prev, currentPage: '404' }));
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle initial load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToProduct = (productId: string) => {
    window.location.hash = `product/${productId}`;
  };

  const navigateBack = () => {
    window.history.back();
  };

  const handleCartOpen = () => {
    setAppState(prev => ({ ...prev, isCartOpen: true }));
  };

  const handleCartClose = () => {
    setAppState(prev => ({ ...prev, isCartOpen: false }));
  };

  const handleMenuToggle = (isOpen: boolean) => {
    setAppState(prev => ({ ...prev, isMobileMenuOpen: isOpen }));
  };

  // Show success message when items are added to cart
  useEffect(() => {
    const handleCartAdd = () => {
      toast.success('Item added to cart!', {
        description: 'Check your cart to review your items.',
        action: {
          label: 'View Cart',
          onClick: () => handleCartOpen(),
        },
      });
    };

    // Listen for custom cart events (you could dispatch these from the context)
    window.addEventListener('cart-add', handleCartAdd);
    return () => window.removeEventListener('cart-add', handleCartAdd);
  }, []);

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage />;
      case 'bundles':
        return <BundlesPage />;
      case 'product-story':
        return appState.selectedProductId ? (
          <ProductStoryPage 
            productId={appState.selectedProductId} 
            onBack={navigateBack}
          />
        ) : <HomePage />;
      case 'discover':
        return <DiscoverPage />;
      case 'profile':
        return <ProfilePage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'checkout-success':
        return <CheckoutSuccessPage />;
      case 'upi-verify':
        return <UpiVerifyPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'debug':
        return <DebugPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar 
        onCartOpen={handleCartOpen}
        onMenuToggle={handleMenuToggle}
      />

      {/* Main Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={appState.currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer - Hide on mobile when menu is open */}
      {!appState.isMobileMenuOpen && <Footer />}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={appState.isCartOpen} 
        onClose={handleCartClose}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          },
        }}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}

// Placeholder components for other pages
const DiscoverPage: React.FC = () => (
  <div className="min-h-screen pt-16 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl mb-4">Discover</h1>
      <p className="text-muted-foreground">Coming soon...</p>
    </div>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen pt-16 flex items-center justify-center">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.h1
        className="text-8xl md:text-9xl mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        404
      </motion.h1>
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist in the future.
      </p>
      <motion.button
        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.hash = 'home'}
      >
        Return Home
      </motion.button>
    </motion.div>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}