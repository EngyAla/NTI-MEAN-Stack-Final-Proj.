const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'English item name is required'],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, 'Arabic item name is required'],
        trim: true,
      },
    },
    description: {
      en: {
        type: String,
        required: [true, 'English item description is required'],
        trim: true,
      },
      ar: {
        type: String,
        required: [true, 'Arabic item description is required'],
        trim: true,
      },
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
    image: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    material: {
      en: {
        type: String,
        trim: true,
        default: 'Full-Grain Italian Calfskin / Gilded Brass',
      },
      ar: {
        type: String,
        trim: true,
        default: 'جلد عجل إيطالي نخب أول / نحاس مطلي بذهب عيار 18',
      },
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
itemSchema.index({ 'name.en': 'text', 'name.ar': 'text', 'description.en': 'text', 'description.ar': 'text' });
itemSchema.index({ category: 1 });

// Synchronize imageUrl and image
itemSchema.pre('save', function (next) {
  if (this.image && !this.imageUrl) this.imageUrl = this.image;
  if (this.imageUrl && !this.image) this.image = this.imageUrl;
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('Item', itemSchema);
