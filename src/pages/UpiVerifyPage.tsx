import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { paymentAPI, userAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';
import { 
  Smartphone, 
  Loader2, 
  CheckCircle, 
  ExternalLink,
  AlertCircle 
} from 'lucide-react';

export default function UpiVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('orderId');
  const razorpayOrderId = searchParams.get('razorpayOrderId');
  const upiLink = searchParams.get('upiLink');
  
  const [paymentId, setPaymentId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!orderId || !upiLink) {
      toast.error('Invalid payment session');
      navigate('/checkout');
    }
  }, [orderId, upiLink, navigate]);

  const handleOpenUpiApp = () => {
    if (upiLink) {
      window.location.href = decodeURIComponent(upiLink);
      toast.success('Opening UPI app...');
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId.trim()) {
      toast.error('Please enter your Razorpay payment ID');
      return;
    }

    if (!orderId || !razorpayOrderId) {
      toast.error('Order information not found');
      return;
    }

    setVerifying(true);
    try {
      // For UPI, signature verification might not be available from user input
      // In production, use webhooks or server-side polling to verify
      const response = await paymentAPI.verifyUpiPayment(orderId, {
        razorpay_payment_id: paymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: 'manual_verification', // Will be validated server-side via Razorpay API
      });
      
      if (response.success) {
        setPaymentCompleted(true);
        toast.success('Payment verified successfully!');
        
        // Clear the cart
        try {
          await userAPI.clearCart();
        } catch (error) {
          console.error('Failed to clear cart:', error);
        }

        // Redirect to success page after 2 seconds
        setTimeout(() => {
          navigate(`/profile/orders`);
        }, 2000);
      } else {
        toast.error('Payment verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center py-20">
        <div className="container max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-green-500/20 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </motion.div>

              <h1 className="text-3xl mb-3 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Payment Verified!
              </h1>
              <p className="text-slate-400 mb-6">
                Your UPI payment has been confirmed. Redirecting to orders...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-20">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Complete UPI Payment
              </h1>
              <p className="text-slate-400">
                Pay using your preferred UPI app
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="mb-2">Instructions</h3>
                  <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Click the button below to open your UPI app</li>
                    <li>Complete the payment in your UPI app</li>
                    <li>Note down the transaction ID/UTR number</li>
                    <li>Enter the transaction ID below to verify payment</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Open UPI App Button */}
            <Button
              onClick={handleOpenUpiApp}
              className="w-full mb-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open UPI App to Pay
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-sm text-slate-500">After Payment</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Payment ID Input */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="paymentId">Razorpay Payment ID</Label>
                <Input
                  id="paymentId"
                  placeholder="Enter payment ID (starts with pay_)"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className="bg-slate-800/50 border-slate-700"
                  disabled={verifying}
                />
                <p className="text-xs text-slate-500 mt-2">
                  You'll receive this in the payment confirmation screen or SMS
                </p>
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyPayment}
              disabled={verifying || !paymentId.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              size="lg"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Payment
                </>
              )}
            </Button>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Having trouble?{' '}
                <button
                  onClick={() => navigate('/checkout')}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Go back to checkout
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
