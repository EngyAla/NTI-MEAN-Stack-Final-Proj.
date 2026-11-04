const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Translation key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    en: {
      type: String,
      required: [true, 'English translation is required'],
      trim: true,
    },
    ar: {
      type: String,
      required: [true, 'Arabic translation is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Translation', translationSchema);
