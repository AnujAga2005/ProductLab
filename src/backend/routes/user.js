import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.productId')
      .populate('cart.bundleId')
      .populate('wishlist')
      .select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  isAuthenticated,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, email, preferences } = req.body;
      const updateFields = {};

      if (name) updateFields.name = name;
      if (email) updateFields.email = email.toLowerCase();
      if (preferences) updateFields.preferences = preferences;

      // Check if email is already taken
      if (email) {
        const existingUser = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: req.user._id },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
      });
    }
  }
);

// @route   GET /api/user/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.productId')
      .populate('cart.bundleId');

    res.json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
    });
  }
});

// @route   POST /api/user/cart
// @desc    Add item to cart
// @access  Private
router.post('/cart', isAuthenticated, async (req, res) => {
  try {
    const { productId, bundleId, quantity = 1 } = req.body;

    if (!productId && !bundleId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID or Bundle ID is required',
      });
    }

    const user = await User.findById(req.user._id);

    // Check if item already in cart
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        (productId && item.productId?.toString() === productId) ||
        (bundleId && item.bundleId?.toString() === bundleId)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      user.cart.push({
        productId,
        bundleId,
        quantity,
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('cart.productId')
      .populate('cart.bundleId');

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
    });
  }
});

// @route   PUT /api/user/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/:itemId', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity',
      });
    }

    const user = await User.findById(req.user._id);
    const cartItem = user.cart.id(req.params.itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('cart.productId')
      .populate('cart.bundleId');

    res.json({
      success: true,
      message: 'Cart updated',
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
    });
  }
});

// @route   DELETE /api/user/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart.pull(req.params.itemId);
    await user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('cart.productId')
      .populate('cart.bundleId');

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
    });
  }
});

// @route   DELETE /api/user/cart
// @desc    Clear cart
// @access  Private
router.delete('/cart', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { cart: [] } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Cart cleared',
      cart: user.cart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
    });
  }
});

// @route   GET /api/user/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    res.json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
    });
  }
});

// @route   POST /api/user/wishlist/:productId
// @desc    Add/Remove product from wishlist
// @access  Private
router.post('/wishlist/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    const index = user.wishlist.indexOf(productId);

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      await user.save();

      const updatedUser = await User.findById(req.user._id).populate('wishlist');

      return res.json({
        success: true,
        message: 'Product removed from wishlist',
        wishlist: updatedUser.wishlist,
      });
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      await user.save();

      const updatedUser = await User.findById(req.user._id).populate('wishlist');

      return res.json({
        success: true,
        message: 'Product added to wishlist',
        wishlist: updatedUser.wishlist,
      });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating wishlist',
    });
  }
});

// @route   GET /api/user/orders
// @desc    Get user orders
// @access  Private
router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.productId')
      .populate('items.bundleId');

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
});

// @route   POST /api/user/orders
// @desc    Create new order
// @access  Private
router.post('/orders', isAuthenticated, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order',
      });
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Clear user cart
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    // Add order to user's orders
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
    });
  }
});

// @route   GET /api/user/orders/:orderId
// @desc    Get single order
// @access  Private
router.get('/orders/:orderId', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    })
      .populate('items.productId')
      .populate('items.bundleId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
    });
  }
});

export default router;
