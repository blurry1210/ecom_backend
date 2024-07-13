const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');


router.post('/rate/:itemId', async (req, res) => {
  const { userId, rating } = req.body;
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    item.ratings.push({ user: userId, rating });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/rate-distributor/:distributorId', async (req, res) => {
  const { userId, rating } = req.body;
  try {
    const distributor = await User.findById(req.params.distributorId);
    if (!distributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }
    distributor.ratings.push({ user: userId, rating });
    await distributor.save();
    res.json(distributor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/distributor/:distributorId', async (req, res) => {
  try {
    const items = await Item.find({ distributor: req.params.distributorId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error adding new item:', error);
        res.status(400).json({ message: "Error adding new item", error: error.message, details: error.errors });
    }
});

router.get('/', async (req, res) => {
    try {
      const items = await Item.find().populate('distributor', 'firstName lastName email'); // Populate distributor info
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;
