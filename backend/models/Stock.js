const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique combination of product and location
stockSchema.index({ productId: 1, locationId: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
