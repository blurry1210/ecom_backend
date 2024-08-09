const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  quantity: { type: Number, required: true },
  distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String],
  reviews: [reviewSchema]
});

module.exports = mongoose.model('Product', ProductSchema);
