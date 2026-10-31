const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Item name must be at least 2 characters'],
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Item category is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Primary image URL is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    material: {
      type: String,
      trim: true,
      default: 'Full-Grain Italian Calfskin / Gilded Brass',
    },
    dimensions: {
      type: String,
      trim: true,
      default: 'Standard Boutique Specification',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search & category filtering
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1 });

module.exports = mongoose.model('Item', itemSchema);
