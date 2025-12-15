import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsAPI, bundlesAPI, userAPI, authAPI } from '../services/api';

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

interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  savings: number;
  image: string;
  products: string[];
  tags: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  wishlist: string[];
  orderHistory: any[];
}

interface CartItem {
  productId: string;
  quantity: number;
  variant?: any;
}

interface AppContextType {
  products: Product[];
  bundles: Bundle[];
  currentUser: User | null;
  cart: CartItem[];
  isDarkMode: boolean;
  searchQuery: string;
  isLoading: boolean;
  isBackendConnected: boolean;
  setSearchQuery: (query: string) => void;
  addToCart: (productId: string, quantity?: number, variant?: any) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDarkMode: () => void;
  getProduct: (id: string) => Product | undefined;
  getBundle: (id: string) => Bundle | undefined;
  cartTotal: number;
  cartCount: number;
  refreshAuth: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true); // Try backend first

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.checkAuthStatus();
        if (response.success && response.user) {
          setCurrentUser({
            id: response.user._id || response.user.id,
            username: response.user.name || response.user.username || 'User',
            email: response.user.email,
            avatar: response.user.avatar || 'https://unsplash.com/photos/a-phone-with-a-happy-face-on-it-hszJpiM6cr0',
            wishlist: response.user.wishlist || [],
            orderHistory: []
          });
          
          // Load user's cart if authenticated
          const cartData = await userAPI.getCart();
          if (cartData.success && cartData.cart) {
            setCart(cartData.cart.items || []);
          }
        }
      } catch (error) {
        console.log('Not authenticated or backend unavailable');
      }
    };

    checkAuth();
  }, []);

  // Load data from backend or fallback to mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (useBackend) {
          // Try to fetch from backend
          try {
            const [productsResponse, bundlesResponse] = await Promise.all([
              productsAPI.getProducts(),
              bundlesAPI.getBundles()
            ]);

            if (productsResponse.success && bundlesResponse.success) {
              // Normalize backend data - MongoDB uses _id, frontend expects id
              const backendProducts = (productsResponse.products || []).map((p: any) => ({
                ...p,
                id: p._id || p.id, // Ensure 'id' field exists
                images: p.images || [],
                variants: p.variants || {},
                story: p.story || { sections: [] },
                reviews: p.reviews || []
              }));
              
              const backendBundles = (bundlesResponse.bundles || []).map((b: any) => {
                // Transform backend bundle format to frontend format
                // Backend: {products: [{product: ObjectId, quantity: 1}]}
                // Frontend: {products: ['productId1', 'productId2']}
                const productIds = (b.products || []).map((p: any) => {
                  // Handle both populated and non-populated products
                  if (typeof p === 'string') return p;
                  if (p.product) {
                    return typeof p.product === 'string' ? p.product : (p.product._id || p.product.id);
                  }
                  return p._id || p.id;
                }).filter(Boolean);

                return {
                  id: b._id || b.id,
                  title: b.name,
                  description: b.description,
                  price: b.price,
                  originalPrice: b.originalPrice,
                  savings: b.originalPrice - b.price,
                  image: b.image,
                  products: productIds,
                  tags: b.tags || [],
                  category: b.category,
                  badge: b.badge
                };
              });
              
              console.log('Loaded from backend:', {
                productsCount: backendProducts.length,
                bundlesCount: backendBundles.length,
                productIds: backendProducts.map((p: any) => p.id)
              });
              
              setProducts(backendProducts);
              setBundles(backendBundles);
              setIsLoading(false);
              return; // Successfully loaded from backend
            }
          } catch (backendError) {
            console.log('Backend unavailable, falling back to mock data:', backendError);
            setUseBackend(false); // Backend not available, use mock data
          }
        }

        // Fallback to mock data
        const mockProducts: Product[] = [
          {
            id: "p1",
            title: "Neural Interface Headset",
            description: "Next-gen brain-computer interface for seamless digital integration",
            price: 2499,
            category: "tech",
            tags: ["neural", "ai", "premium"],
            images: [
              "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800",
              "https://images.unsplash.com/photo-1592833159155-c62df43b3ac0?w=800"
            ],
            variants: {
              colors: ["quantum-black", "neon-blue", "plasma-white"],
              materials: ["titanium", "carbon-fiber", "bio-plastic"]
            },
            story: {
              sections: [
                {
                  title: "Revolutionary Technology",
                  content: "Built with quantum processors and bio-compatible materials, this headset represents the future of human-computer interaction.",
                  image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800"
                },
                {
                  title: "Maker Story",
                  content: "Crafted by NeuroCorp's leading scientists in Silicon Valley's most advanced lab facilities.",
                  image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800"
                }
              ]
            },
            reviews: [
              {
                id: "r1",
                user: "Alex Chen",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
                rating: 5,
                comment: "Mind-blowing experience. Literally."
              },
              {
                id: "r2",
                user: "Maya Rodriguez",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
                rating: 5,
                comment: "The future is here and it's incredible."
              }
            ]
          },
          {
            id: "p2",
            title: "Quantum Smartwatch",
            description: "Time-bending wearable with holographic display",
            price: 899,
            category: "wearables",
            tags: ["quantum", "holographic", "smart"],
            images: [
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
              "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800"
            ],
            variants: {
              colors: ["void-black", "stellar-silver", "nebula-purple"],
              sizes: ["42mm", "46mm", "50mm"]
            },
            story: {
              sections: [
                {
                  title: "Holographic Interface",
                  content: "Projects a 3D holographic display up to 6 inches above your wrist, visible in any lighting condition.",
                  image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800"
                }
              ]
            },
            reviews: [
              {
                id: "r3",
                user: "Dr. Sarah Kim",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
                rating: 4,
                comment: "Revolutionary display technology!"
              }
            ]
          },
          {
            id: "p3",
            title: "Nano-Fabric Jacket",
            description: "Self-regulating smart jacket with adaptive temperature control",
            price: 1299,
            category: "fashion",
            tags: ["smart", "adaptive", "nano"],
            images: [
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
              "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800"
            ],
            variants: {
              colors: ["stealth-black", "arctic-white", "aurora-green"],
              sizes: ["S", "M", "L", "XL"]
            },
            story: {
              sections: [
                {
                  title: "Adaptive Technology",
                  content: "Nano-fibers respond to body temperature and environmental conditions, keeping you comfortable in any climate.",
                  image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p4",
            title: "Plasma Drone",
            description: "AI-powered companion drone with plasma propulsion",
            price: 3599,
            category: "drones",
            tags: ["ai", "plasma", "companion"],
            images: [
              "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800",
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
            ],
            variants: {
              colors: ["midnight-black", "electric-blue", "solar-gold"],
              features: ["basic-ai", "advanced-ai", "quantum-ai"]
            },
            story: {
              sections: [
                {
                  title: "Plasma Propulsion",
                  content: "Silent plasma engines provide unlimited flight time with zero emissions.",
                  image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p5",
            title: "Biometric Pod Chair",
            description: "Wellness pod that monitors and enhances your mental state",
            price: 4999,
            category: "wellness",
            tags: ["biometric", "wellness", "luxury"],
            images: [
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
            ],
            variants: {
              colors: ["zen-white", "deep-black", "healing-blue"],
              programs: ["meditation", "focus", "recovery"]
            },
            story: {
              sections: [
                {
                  title: "Wellness Technology",
                  content: "Advanced biometric sensors monitor your stress levels and adjust ambient lighting and sound accordingly.",
                  image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p6",
            title: "Hologram Projector",
            description: "Portable device for stunning 3D holographic displays",
            price: 1899,
            category: "tech",
            tags: ["hologram", "portable", "3d"],
            images: [
              "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
            ],
            variants: {
              colors: ["chrome", "matte-black", "transparent"],
              resolution: ["4K", "8K", "16K"]
            },
            story: {
              sections: [
                {
                  title: "Crystal Clear Holograms",
                  content: "Project lifelike 3D images up to 2 meters tall with stunning clarity and color accuracy.",
                  image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p7",
            title: "Neural Keyboard",
            description: "Type with your thoughts using advanced neural detection",
            price: 799,
            category: "peripherals",
            tags: ["neural", "keyboard", "wireless"],
            images: [
              "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800",
              "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"
            ],
            variants: {
              colors: ["cosmic-black", "stellar-white", "nebula-purple"],
              layouts: ["qwerty", "dvorak", "neural-optimized"]
            },
            story: {
              sections: [
                {
                  title: "Thought-to-Text",
                  content: "Revolutionary neural sensors detect micro-movements and brain signals to translate thoughts into text.",
                  image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p8",
            title: "Energy Crystals",
            description: "Quantum energy storage in beautiful crystal form",
            price: 299,
            category: "energy",
            tags: ["quantum", "crystal", "energy"],
            images: [
              "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
              "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800"
            ],
            variants: {
              colors: ["electric-blue", "plasma-green", "solar-amber"],
              capacity: ["1kWh", "5kWh", "10kWh"]
            },
            story: {
              sections: [
                {
                  title: "Quantum Storage",
                  content: "Store massive amounts of energy in quantum-stabilized crystal matrices that never degrade.",
                  image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p9",
            title: "Smart Mirror Display",
            description: "Interactive mirror with AR overlay and health monitoring",
            price: 1299,
            category: "home",
            tags: ["smart-home", "ar", "health"],
            images: [
              "https://images.unsplash.com/photo-1600132806608-231446b2e7af?w=800",
              "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800"
            ],
            variants: {
              sizes: ["24-inch", "32-inch", "43-inch"],
              frame: ["brushed-steel", "matte-black", "rose-gold"]
            },
            story: {
              sections: [
                {
                  title: "Your Daily Health Hub",
                  content: "Get real-time health metrics, weather updates, and personalized recommendations while you get ready.",
                  image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p10",
            title: "Levitating Speaker",
            description: "Magnetically suspended audio with 360° sound projection",
            price: 599,
            category: "audio",
            tags: ["levitating", "wireless", "premium"],
            images: [
              "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
              "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800"
            ],
            variants: {
              colors: ["midnight-black", "pearl-white", "copper-rose"],
              power: ["20W", "40W", "60W"]
            },
            story: {
              sections: [
                {
                  title: "Defying Gravity",
                  content: "Advanced magnetic levitation creates a mesmerizing floating effect while delivering crystal-clear audio.",
                  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p11",
            title: "Biometric Wallet",
            description: "Fingerprint-secured smart wallet with solar charging",
            price: 249,
            category: "accessories",
            tags: ["security", "solar", "smart"],
            images: [
              "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"
            ],
            variants: {
              materials: ["carbon-fiber", "leather", "titanium"],
              capacity: ["6-card", "12-card", "20-card"]
            },
            story: {
              sections: [
                {
                  title: "Ultimate Security",
                  content: "Military-grade encryption and biometric locks keep your valuables safe while solar panels ensure you're always powered.",
                  image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p12",
            title: "Air Purifier Lamp",
            description: "HEPA filtration system disguised as elegant mood lighting",
            price: 399,
            category: "home",
            tags: ["wellness", "air-quality", "lighting"],
            images: [
              "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=800",
              "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800"
            ],
            variants: {
              colors: ["warm-white", "cool-blue", "sunset-amber"],
              coverage: ["200-sqft", "400-sqft", "600-sqft"]
            },
            story: {
              sections: [
                {
                  title: "Breathe Easy",
                  content: "Medical-grade HEPA-13 filters remove 99.97% of airborne particles while creating the perfect ambiance.",
                  image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p13",
            title: "Modular Backpack System",
            description: "Customizable smart backpack with wireless charging ports",
            price: 349,
            category: "accessories",
            tags: ["modular", "travel", "tech"],
            images: [
              "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
              "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"
            ],
            variants: {
              capacity: ["20L", "30L", "40L"],
              modules: ["camera-pod", "laptop-sleeve", "hydration-pack"]
            },
            story: {
              sections: [
                {
                  title: "Built for Adventure",
                  content: "Mix and match modules to create the perfect pack for any journey. Built-in power banks keep your devices charged.",
                  image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p14",
            title: "Smart Plant Pod",
            description: "AI-powered indoor garden with automated care system",
            price: 449,
            category: "home",
            tags: ["plants", "ai", "automation"],
            images: [
              "https://images.unsplash.com/photo-1591958911259-bee2173bdccc?w=800",
              "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800"
            ],
            variants: {
              capacity: ["3-plants", "6-plants", "9-plants"],
              lighting: ["grow-led", "full-spectrum", "smart-adaptive"]
            },
            story: {
              sections: [
                {
                  title: "Nature Meets Tech",
                  content: "AI monitors soil, light, and nutrients to automatically care for your plants. Fresh herbs and greens year-round.",
                  image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800"
                }
              ]
            },
            reviews: []
          },
          {
            id: "p15",
            title: "Thermal Vision Glasses",
            description: "Augmented reality glasses with thermal imaging capability",
            price: 1899,
            category: "wearables",
            tags: ["ar", "thermal", "professional"],
            images: [
              "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800",
              "https://images.unsplash.com/photo-1577801622187-9a1076d049da?w=800"
            ],
            variants: {
              lenses: ["clear", "photochromic", "polarized"],
              modes: ["thermal-only", "ar-overlay", "full-spectrum"]
            },
            story: {
              sections: [
                {
                  title: "See Beyond Visible",
                  content: "Detect heat signatures, overlay digital information, and capture what others can't see. Perfect for professionals and enthusiasts.",
                  image: "https://images.unsplash.com/photo-1617802690658-1173a812650d?w=800"
                }
              ]
            },
            reviews: []
          }
        ];

        // Mock bundles data
        const mockBundles: Bundle[] = [
          {
            id: "b1",
            title: "Nomad Pack",
            description: "Everything you need for the future of remote work",
            price: 4199,
            originalPrice: 4897,
            savings: 698,
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
            products: ["p1", "p2", "p7"],
            tags: ["remote-work", "productivity", "complete"]
          },
          {
            id: "b2",
            title: "Wellness Sanctuary",
            description: "Transform your space into a healing environment",
            price: 6899,
            originalPrice: 7997,
            savings: 1098,
            image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
            products: ["p5", "p8", "p6"],
            tags: ["wellness", "meditation", "luxury"]
          },
          {
            id: "b3",
            title: "Urban Explorer",
            description: "Gear up for adventures in the digital city",
            price: 5697,
            originalPrice: 6597,
            savings: 900,
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            products: ["p3", "p4", "p2"],
            tags: ["adventure", "urban", "smart-gear"]
          }
        ];

        // Mock user data
        const mockUser: User = {
          id: "u1",
          username: "cybernaut_alex",
          email: "alex@future.com",
          avatar: "https://unsplash.com/photos/a-phone-with-a-happy-face-on-it-hszJpiM6cr0",
          wishlist: ["p1", "p4", "p6"],
          orderHistory: [
            {
              id: "o1",
              date: "2024-03-15",
              total: 3599,
              status: "delivered",
              items: ["p4"]
            },
            {
              id: "o2",
              date: "2024-02-28",
              total: 899,
              status: "delivered", 
              items: ["p2"]
            }
          ]
        };

        setProducts(mockProducts);
        setBundles(mockBundles);
        // Don't set mock user - let auth check handle it
        setIsLoading(false);
        
        console.log('Loaded mock data:', {
          productsCount: mockProducts.length,
          bundlesCount: mockBundles.length,
          productIds: mockProducts.map(p => p.id)
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [useBackend]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToCart = (productId: string, quantity = 1, variant?: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity, variant }
            : item
        );
      }
      return [...prev, { productId, quantity, variant }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const getProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) {
      console.log(`Product not found for ID: ${id}`);
      console.log('Available product IDs:', products.map(p => p.id));
    }
    return product;
  };
  
  const getBundle = (id: string) => {
    const bundle = bundles.find(b => b.id === id);
    if (!bundle) {
      console.log(`Bundle not found for ID: ${id}`);
      console.log('Available bundle IDs:', bundles.map(b => b.id));
    }
    return bundle;
  };

  // Function to refresh authentication state
  const refreshAuth = async () => {
    try {
      const response = await authAPI.checkAuthStatus();
      if (response.success && response.user) {
        setCurrentUser({
          id: response.user._id || response.user.id,
          username: response.user.name || response.user.username || 'User',
          email: response.user.email,
          avatar: response.user.avatar || 'https://unsplash.com/photos/a-phone-with-a-happy-face-on-it-hszJpiM6cr0',
          wishlist: response.user.wishlist || [],
          orderHistory: []
        });
        
        // Load user's cart if authenticated
        const cartData = await userAPI.getCart();
        if (cartData.success && cartData.cart) {
          setCart(cartData.cart.items || []);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.log('Failed to refresh auth');
      setCurrentUser(null);
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    const product = getProduct(item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value: AppContextType = {
    products,
    bundles,
    currentUser,
    cart,
    isDarkMode,
    searchQuery,
    isLoading,
    isBackendConnected: useBackend,
    setSearchQuery,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleDarkMode,
    getProduct,
    getBundle,
    cartTotal,
    cartCount,
    refreshAuth,
    setCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};