const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }]
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
