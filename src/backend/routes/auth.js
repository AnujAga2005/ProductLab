import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Create new user
      const user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
        authProvider: 'local',
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error logging in after signup',
          });
        }

        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
          user: user.toJSON(),
        });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during signup',
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Server error during login',
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || 'Invalid credentials',
        });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error logging in',
          });
        }

        return res.json({
          success: true,
          message: 'Login successful',
          user: user.toJSON(),
        });
      });
    })(req, res, next);
  }
);

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/#/login?error=auth_failed`,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/#/profile`);
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out',
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error destroying session',
        });
      }

      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logout successful',
      });
    });
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   GET /api/auth/status
// @desc    Check authentication status
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    success: true,
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null,
  });
});

export default router;
