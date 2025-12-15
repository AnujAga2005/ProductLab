import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { isAuthenticated } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID_HERE',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE',
});

// ============================================================================
// CREATE RAZORPAY ORDER
// ============================================================================
router.post('/create-order', isAuthenticated, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required',
      });
    }

    // Calculate total amount
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shipping + tax;

    // Create order in database with pending payment
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      status: 'pending',
    });

    await order.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Amount in paise (₹1 = 100 paise)
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        userEmail: req.user.email,
      },
    });

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
});

// ============================================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================================
router.post('/verify-payment', isAuthenticated, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters',
      });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order,
      });
    } else {
      // Invalid signature
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
});

// ============================================================================
// RAZORPAY WEBHOOK (for handling payment events)
// ============================================================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret) {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        console.error('Webhook signature verification failed');
        return res.status(400).send('Webhook signature verification failed');
      }
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        const orderId = payload.notes?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.paymentStatus !== 'completed') {
            order.paymentStatus = 'completed';
            order.status = 'processing';
            order.razorpayPaymentId = payload.id;
            await order.save();
          }
        }
        break;

      case 'payment.failed':
        // Payment failed
        const failedOrderId = payload.notes?.orderId;
        if (failedOrderId) {
          const order = await Order.findById(failedOrderId);
          if (order) {
            order.paymentStatus = 'failed';
            await order.save();
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ============================================================================
// CREATE UPI PAYMENT (Alternative using Razorpay UPI)
// ============================================================================
router.post('/create-upi-payment', isAuthenticated, async (req, res) => {
  try {
    const { items, shippingAddress, upiVPA } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required',
      });
    }

    if (!upiVPA) {
      return res.status(400).json({
        success: false,
        message: 'UPI VPA is required',
      });
    }

    // Calculate total amount
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shipping + tax;

    // Create order with UPI payment method
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'upi',
      paymentStatus: 'pending',
      status: 'pending',
      upiVPA,
    });

    await order.save();

    // Create Razorpay UPI order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      method: 'upi',
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        upiVPA,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Generate UPI payment link
    const upiLink = `upi://pay?pa=${upiVPA}&pn=ProductLab&am=${totalAmount}&cu=INR&tn=Order ${order.orderNumber}`;

    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      upiLink,
      totalAmount,
      keyId: process.env.RAZORPAY_KEY_ID,
      message: 'UPI payment initiated. Please complete payment on your UPI app.',
    });
  } catch (error) {
    console.error('Error creating UPI payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create UPI payment',
      error: error.message,
    });
  }
});

// ============================================================================
// VERIFY UPI PAYMENT
// ============================================================================
router.post('/verify-upi/:orderId', isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentMethod !== 'upi') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method for this order',
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      res.json({
        success: true,
        message: 'UPI payment verified successfully',
        order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Error verifying UPI payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify UPI payment',
      error: error.message,
    });
  }
});

// ============================================================================
// GET PAYMENT STATUS
// ============================================================================
router.get('/status/:orderId', isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message,
    });
  }
});

// ============================================================================
// FETCH PAYMENT DETAILS (for order history)
// ============================================================================
router.get('/details/:paymentId', isAuthenticated, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Fetch payment from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
});

export default router;
