const mongoose = require('mongoose');

const localizedStringSchema = {
  en: {
    type: String,
    required: [true, 'English category name is required'],
    trim: true,
  },
  ar: {
    type: String,
    required: [true, 'Arabic category name is required'],
    trim: true,
  },
};

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
      en: {
        type: String,
        trim: true,
        default: '',
      },
      ar: {
        type: String,
        trim: true,
        default: '',
      },
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for item count
categorySchema.virtual('itemCount', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Synchronize imageUrl and image
categorySchema.pre('save', function (next) {
  if (this.image && !this.imageUrl) this.imageUrl = this.image;
  if (this.imageUrl && !this.image) this.image = this.imageUrl;
  if (typeof next === 'function') next();
});

module.exports = mongoose.model('Category', categorySchema);
