
const Order = require('../models/Order');

exports.getDistributorOrders = async (req, res) => {
  try {
    const distributorId = req.params.distributorId;
    console.log(`Fetching orders for distributor: ${distributorId}`);
    const orders = await Order.find({ 'items.distributor': distributorId }).populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch distributor orders:', error); 
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Failed to update item status:', error);
    res.status(500).json({ message: 'Failed to update item status', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, totalPrice } = req.body;
    const userId = req.user._id;

    console.log('Received order creation request:', req.body);

   
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

    console.log('Order items:', orderItems);

    const newOrder = new Order({
      userId,
      items: orderItems,
      address,
      paymentMethod,
      totalPrice,
      createdAt: new Date(), 
    });

    console.log('New order:', newOrder);

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};
