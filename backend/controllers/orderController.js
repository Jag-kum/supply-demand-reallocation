const Order = require('../models/Order');
const Stock = require('../models/Stock');
const Product = require('../models/Product');
const Location = require('../models/Location');

// Order product
const orderProduct = async (req, res) => {
  try {
    const { productId, locationId, quantity } = req.body;
    const userId = req.user.id;

    // Check if product and location exist
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

    // Check stock availability
    const stock = await Stock.findOne({ productId, locationId });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Create order in ordered status (order → purchase workflow)
    const order = new Order({
      userId,
      productId,
      locationId,
      quantity,
      status: 'ordered'
    });

    await order.save();

    // Decrease stock quantity
    stock.quantity -= quantity;
    await stock.save();

    // Populate the order with product and location details
    await order.populate('productId', 'name category price');
    await order.populate('locationId', 'name city');

    res.status(201).json({
      success: true,
      message: 'Product ordered successfully',
      data: order
    });
  } catch (error) {
    console.error('Order product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to order product'
    });
  }
};

// Purchase product (convert reservation to purchase)
const purchaseProduct = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the order
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'ordered' && order.status !== 'reserved') {
      return res.status(400).json({
        success: false,
        message: 'Order must be in an ordered status to purchase'
      });
    }

    // Check stock availability again
    const stock = await Stock.findOne({ 
      productId: order.productId, 
      locationId: order.locationId 
    });

    if (!stock || stock.quantity < order.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available for purchase'
      });
    }

    // Update stock
    stock.quantity -= order.quantity;
    await stock.save();

    // Update order status
    order.status = 'purchased';
    await order.save();

    // Populate the order with product and location details
    await order.populate('productId', 'name category price');
    await order.populate('locationId', 'name city');

    res.json({
      success: true,
      message: 'Product purchased successfully',
      data: order
    });
  } catch (error) {
    console.error('Purchase product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase product'
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Users can only view their own orders (unless admin)
    if (requestingUserId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const orders = await Order.find({ userId })
      .populate('productId', 'name category price')
      .populate('locationId', 'name city')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'purchased') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a purchased order'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

module.exports = {
  orderProduct,
  purchaseProduct,
  getUserOrders,
  cancelOrder
};
