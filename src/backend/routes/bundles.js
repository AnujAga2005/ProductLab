import express from 'express';
import Bundle from '../models/Bundle.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bundles
// @desc    Get all bundles
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const bundles = await Bundle.find(query)
      .populate('products.product')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Bundle.countDocuments(query);

    res.json({
      success: true,
      bundles,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Get bundles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bundles',
    });
  }
});

// @route   GET /api/bundles/:slug
// @desc    Get single bundle by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const bundle = await Bundle.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate('products.product');

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found',
      });
    }

    res.json({
      success: true,
      bundle,
    });
  } catch (error) {
    console.error('Get bundle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bundle',
    });
  }
});

export default router;
