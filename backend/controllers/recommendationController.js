const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const Location = require('../models/Location');

// Get all recommendations
const getRecommendations = async (req, res) => {
  try {
  const recommendations = await Recommendation.find()
      .populate('productId', 'name category price')
      .populate('fromLocationId', 'name city latitude longitude')
      .populate('toLocationId', 'name city latitude longitude')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
};

// Get single recommendation
const getRecommendation = async (req, res) => {
  try {
  const recommendation = await Recommendation.findById(req.params.id)
      .populate('productId', 'name category price')
      .populate('fromLocationId', 'name city latitude longitude')
      .populate('toLocationId', 'name city latitude longitude');

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Get recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendation'
    });
  }
};

// Approve recommendation
const approveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    const recommendation = await Recommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    if (recommendation.approved) {
      return res.status(400).json({
        success: false,
        message: 'Recommendation already approved'
      });
    }

    // Update recommendation status
    recommendation.approved = true;
    await recommendation.save();

    // Here you would typically implement the actual transfer logic
    // For now, we'll just mark it as approved
    // In a real system, this would trigger inventory transfers

    res.json({
      success: true,
      message: 'Recommendation approved successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Approve recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve recommendation'
    });
  }
};

// Create recommendation (for testing/admin purposes)
const createRecommendation = async (req, res) => {
  try {
    const { productId, fromLocationId, toLocationId, quantity, priority } = req.body;

    // Validate that product and locations exist
    const product = await Product.findById(productId);
    const fromLocation = await Location.findById(fromLocationId);
    const toLocation = await Location.findById(toLocationId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!fromLocation) {
      return res.status(404).json({
        success: false,
        message: 'From location not found'
      });
    }

    if (!toLocation) {
      return res.status(404).json({
        success: false,
        message: 'To location not found'
      });
    }

    const recommendation = new Recommendation({
      productId,
      fromLocationId,
      toLocationId,
      quantity,
      priority: priority || 'medium'
    });

    await recommendation.save();

    // Populate the recommendation
    await recommendation.populate('productId', 'name category price');
    await recommendation.populate('fromLocationId', 'name city latitude longitude');
    await recommendation.populate('toLocationId', 'name city latitude longitude');

    res.status(201).json({
      success: true,
      message: 'Recommendation created successfully',
      data: recommendation
    });
  } catch (error) {
    console.error('Create recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create recommendation'
    });
  }
};

module.exports = {
  getRecommendations,
  getRecommendation,
  approveRecommendation,
  createRecommendation
};
