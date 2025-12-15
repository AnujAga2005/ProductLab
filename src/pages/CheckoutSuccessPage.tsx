import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { paymentAPI, userAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, Package, Loader2, Home, Receipt } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [order, setOrder] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error('Invalid payment session');
        navigate('/');
        return;
      }

      try {
        const response = await paymentAPI.verifyStripePayment(sessionId);
        
        if (response.success) {
          setOrder(response.order);
          toast.success('Payment successful!');
          
          // Clear the cart after successful payment
          try {
            await userAPI.clearCart();
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        } else {
          toast.error('Payment verification failed');
          navigate('/checkout');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        toast.error(error.message || 'Failed to verify payment');
        navigate('/checkout');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 py-20">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-slate-900/50 backdrop-blur-xl border-green-500/20 p-8 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl mb-3 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 mb-8"
            >
              Thank you for your purchase. Your order has been confirmed.
            </motion.p>

            {/* Order Details */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-800/50 rounded-xl p-6 mb-8 text-left"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg">Order Details</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Number</span>
                    <span className="font-mono">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Amount</span>
                    <span className="text-xl text-green-400">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Method</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Status</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={() => navigate('/profile/orders')}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                <Receipt className="w-4 h-4 mr-2" />
                View Order Details
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 border-slate-700 hover:bg-slate-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </motion.div>

            {/* Additional Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-slate-500 mt-6"
            >
              A confirmation email has been sent to your registered email address.
            </motion.p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
