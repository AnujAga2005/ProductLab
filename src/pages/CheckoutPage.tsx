import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { paymentAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { 
  CreditCard, 
  Smartphone, 
  ShoppingBag, 
  MapPin, 
  Loader2,
  ChevronRight,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, currentUser, clearCart, getProduct } = useApp();
  
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: currentUser?.username || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
      if (!loaded) {
        toast.error('Failed to load payment gateway');
      }
    });
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      window.location.hash = 'home';
    }
  }, [cart]);

  // Show login dialog if not logged in
  useEffect(() => {
    if (!currentUser) {
      setShowLoginDialog(true);
    }
  }, [currentUser]);

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const required = ['fullName', 'address', 'city', 'state', 'zipCode', 'country'];
    for (const field of required) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (paymentMethod === 'upi' && !upiId) {
      toast.error('Please enter your UPI ID');
      return false;
    }

    return true;
  };

  const handleRazorpayCheckout = async () => {
    if (!validateForm()) return;
    if (!razorpayLoaded) {
      toast.error('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        name: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      const response = await paymentAPI.createRazorpayOrder({
        items,
        shippingAddress,
      });

      if (response.success && response.razorpayOrderId) {
        // Initialize Razorpay checkout
        const options = {
          key: response.keyId,
          amount: response.amount,
          currency: response.currency,
          name: 'Product Lab',
          description: 'Order Payment',
          order_id: response.razorpayOrderId,
          handler: async function (razorpayResponse: any) {
            try {
              // Verify payment on backend
              const verifyResponse = await paymentAPI.verifyRazorpayPayment({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                orderId: response.orderId,
              });

              if (verifyResponse.success) {
                toast.success('Payment successful!');
                clearCart();
                navigate(`/checkout/success?order_id=${response.orderId}`);
              } else {
                toast.error('Payment verification failed');
                setLoading(false);
              }
            } catch (error: any) {
              console.error('Payment verification error:', error);
              toast.error(error.message || 'Payment verification failed');
              setLoading(false);
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            email: currentUser?.email || '',
            contact: '',
          },
          notes: {
            address: `${shippingAddress.address}, ${shippingAddress.city}`,
          },
          theme: {
            color: '#06b6d4', // Cyan-500
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              toast.error('Payment cancelled');
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error: any) {
      console.error('Razorpay checkout error:', error);
      toast.error(error.message || 'Failed to create order');
      setLoading(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        name: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      const response = await paymentAPI.createUpiPayment({
        items,
        shippingAddress,
        upiVPA: upiId,
      });

      if (response.success) {
        toast.success('UPI payment initiated!');
        // Navigate to UPI verification page
        navigate(`/checkout/upi-verify?orderId=${response.orderId}&razorpayOrderId=${response.razorpayOrderId}&upiLink=${encodeURIComponent(response.upiLink)}`);
      }
    } catch (error: any) {
      console.error('UPI payment error:', error);
      toast.error(error.message || 'Failed to create UPI payment');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'razorpay') {
      handleRazorpayCheckout();
    } else {
      handleUpiPayment();
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-20">
      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog && !currentUser} onOpenChange={setShowLoginDialog}>
        <DialogContent className="glass-panel max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Login Required</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You need to be logged in to proceed with checkout. Please login or create a new account to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 neon-glow-cyan"
              onClick={() => {
                setShowLoginDialog(false);
                window.location.hash = 'login';
              }}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login to Continue
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowLoginDialog(false);
                window.location.hash = 'signup';
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Account
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowLoginDialog(false);
                window.location.hash = 'home';
              }}
            >
              Go Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-muted-foreground">Complete your order securely</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20">
                    <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h2 className="text-xl">Shipping Address</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </form>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20'
                        : 'border-border hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <CreditCard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium">Card / UPI / Netbanking</p>
                        <p className="text-sm text-muted-foreground">Powered by Razorpay</p>
                      </div>
                    </div>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/20'
                        : 'border-border hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Direct UPI Payment</p>
                        <p className="text-sm text-muted-foreground">Pay via Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                  </div>

                  {/* UPI ID Input */}
                  {paymentMethod === 'upi' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2"
                    >
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl">Order Summary</h2>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cart.slice(0, 3).map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm">₹{(item.price * item.quantity * 80).toFixed(2)}</p>
                    </div>
                  ))}
                  {cart.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{cart.length - 3} more items
                    </p>
                  )}
                </div>

                <Separator className="mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(subtotal * 80).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${(shipping * 80).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>₹{(tax * 80).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-2xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      ₹{(total * 80).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !razorpayLoaded}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Payment
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  Secure & encrypted payment
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
