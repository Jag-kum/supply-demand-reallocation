const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  fromLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  toLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
