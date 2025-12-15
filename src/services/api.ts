// API Service for connecting to backend
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5001/api';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...defaultOptions,
    ...options,
  });

  return handleResponse(response);
}

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  // Sign up with email/password
  signup: async (email: string, password: string, name: string) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  // Login with email/password
  login: async (email: string, password: string) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Logout
  logout: async () => {
    return fetchWithAuth('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return fetchWithAuth('/auth/me');
  },

  // Check auth status
  checkAuthStatus: async () => {
    return fetchWithAuth('/auth/status');
  },

  // Google OAuth login URL
  getGoogleLoginUrl: () => {
    return `${API_URL}/auth/google`;
  },
};

// ============================================================================
// PRODUCTS API
// ============================================================================

export const productsAPI = {
  // Get all products with filters
  getProducts: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    return fetchWithAuth(url);
  },

  // Get single product by slug
  getProduct: async (slug: string) => {
    return fetchWithAuth(`/products/${slug}`);
  },

  // Get products by category
  getProductsByCategory: async (category: string) => {
    return fetchWithAuth(`/products/category/${category}`);
  },
};

// ============================================================================
// BUNDLES API
// ============================================================================

export const bundlesAPI = {
  // Get all bundles
  getBundles: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `/bundles${queryParams.toString() ? `?${queryParams}` : ''}`;
    return fetchWithAuth(url);
  },

  // Get single bundle by slug
  getBundle: async (slug: string) => {
    return fetchWithAuth(`/bundles/${slug}`);
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return fetchWithAuth('/user/profile');
  },

  // Update user profile
  updateProfile: async (data: {
    name?: string;
    email?: string;
    preferences?: {
      theme?: string;
      notifications?: boolean;
    };
  }) => {
    return fetchWithAuth('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get cart
  getCart: async () => {
    return fetchWithAuth('/user/cart');
  },

  // Add item to cart
  addToCart: async (productId?: string, bundleId?: string, quantity = 1) => {
    return fetchWithAuth('/user/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, bundleId, quantity }),
    });
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, quantity: number) => {
    return fetchWithAuth(`/user/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  removeFromCart: async (itemId: string) => {
    return fetchWithAuth(`/user/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Clear cart
  clearCart: async () => {
    return fetchWithAuth('/user/cart', {
      method: 'DELETE',
    });
  },

  // Get wishlist
  getWishlist: async () => {
    return fetchWithAuth('/user/wishlist');
  },

  // Toggle product in wishlist
  toggleWishlist: async (productId: string) => {
    return fetchWithAuth(`/user/wishlist/${productId}`, {
      method: 'POST',
    });
  },

  // Get orders
  getOrders: async () => {
    return fetchWithAuth('/user/orders');
  },

  // Create order
  createOrder: async (data: {
    items: Array<{
      productId?: string;
      bundleId?: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
  }) => {
    return fetchWithAuth('/user/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get single order
  getOrder: async (orderId: string) => {
    return fetchWithAuth(`/user/orders/${orderId}`);
  },
};

// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentAPI = {
  // Create Razorpay order
  createRazorpayOrder: async (data: {
    items: Array<{
      productId?: string;
      bundleId?: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) => {
    return fetchWithAuth('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => {
    return fetchWithAuth('/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Create UPI payment
  createUpiPayment: async (data: {
    items: Array<{
      productId?: string;
      bundleId?: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    upiVPA: string;
  }) => {
    return fetchWithAuth('/payment/create-upi-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Verify UPI payment
  verifyUpiPayment: async (orderId: string, data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    return fetchWithAuth(`/payment/verify-upi/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get payment status
  getPaymentStatus: async (orderId: string) => {
    return fetchWithAuth(`/payment/status/${orderId}`);
  },

  // Get payment details
  getPaymentDetails: async (paymentId: string) => {
    return fetchWithAuth(`/payment/details/${paymentId}`);
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthAPI = {
  check: async () => {
    return fetchWithAuth('/health');
  },
};

export default {
  auth: authAPI,
  products: productsAPI,
  bundles: bundlesAPI,
  user: userAPI,
  payment: paymentAPI,
  health: healthAPI,
};