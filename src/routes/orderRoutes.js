const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Ensure the Order model is imported
const authenticate = require('../middleware/authenticate');
const { getDistributorOrders, updateItemStatus } = require('../controllers/orderController');

// creare comanda
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, address, paymentMethod, totalPrice } = req.body;
    const userId = req.user._id;

    
    const orderItems = items.map(item => {
      if (!item.productId) {
        throw new Error('Product ID is missing in item');
      }
      return {
        product: item.productId,
        quantity: item.quantity,
        distributor: item.distributor,
        status: 'pending',
      };
    });

    const newOrder = new Order({
      userId,
      items: orderItems,
      address,
      paymentMethod,
      totalPrice,
      createdAt: new Date(), 
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// preluare comanda de la user
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

// detalii comanda
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

// comenzi distribuitori
router.get('/distributor/:distributorId', authenticate, getDistributorOrders);

// update la produse
router.put('/:orderId/items/:itemId/status', authenticate, updateItemStatus);

module.exports = router;
