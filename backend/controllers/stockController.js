const Stock = require('../models/Stock');
const Product = require('../models/Product');
const Location = require('../models/Location');

// Get stock for a specific location
const getStockByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const stock = await Stock.find({ locationId })
      .populate('productId', 'name category price description')
      .populate('locationId', 'name city address')
      .sort({ 'productId.name': 1 });

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock'
    });
  }
};

// Get all stock with product and location details
const getAllStock = async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate('productId', 'name category price description')
      .populate('locationId', 'name city address')
      .sort({ 'locationId.name': 1, 'productId.name': 1 });

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get all stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock'
    });
  }
};

// Update stock quantity
const updateStock = async (req, res) => {
  try {
    const { productId, locationId, quantity } = req.body;

    // Validate that product and location exist
    const product = await Product.findById(productId);
    const location = await Location.findById(locationId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Update or create stock entry
    const stock = await Stock.findOneAndUpdate(
      { productId, locationId },
      { quantity },
      { new: true, upsert: true, runValidators: true }
    ).populate('productId', 'name category price')
     .populate('locationId', 'name city');

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};

// Get stock summary for dashboard
const getStockSummary = async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate('productId', 'name category price')
      .populate('locationId', 'name city');

    // Calculate summary statistics
    const totalProducts = await Product.countDocuments();
    const totalLocations = await Location.countDocuments();
    
    const lowStockItems = stock.filter(item => item.quantity < 5).length;
    
    const totalValue = stock.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalLocations,
        lowStockItems,
        totalValue,
        stock
      }
    });
  } catch (error) {
    console.error('Get stock summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock summary'
    });
  }
};

module.exports = {
  getStockByLocation,
  getAllStock,
  updateStock,
  getStockSummary
};
