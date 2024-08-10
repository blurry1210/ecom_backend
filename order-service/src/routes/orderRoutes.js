const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); 
const Product = require('../models/Product');
const authenticate = require('../middleware/authenticate');
const { getDistributorOrders, updateItemStatus, createOrder } = require('../controllers/orderController'); // Import createOrder

router.post('/', authenticate, createOrder);

router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});

router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order', error });
  }
});

router.get('/orders/:orderId', async (req, res) => {
  try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId).populate('items.product');

      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
  } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

router.get('/distributor/:distributorId', authenticate, getDistributorOrders);

router.put('/:orderId/items/:itemId/status', authenticate, updateItemStatus);

module.exports = router;
