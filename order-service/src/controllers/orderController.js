const { sendEmail } = require('../utils/sendEmail');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product'); // Ensure Product is imported

// Fetch orders for a specific distributor
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

// Update the status of an item within an order
exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, totalPrice } = req.body;
    const userId = req.user._id;

    console.log('Received order creation request:', req.body);

    // Fetch product details for the order items
    const orderItems = await Promise.all(
      items.map(async (item) => {
        if (!item.productId) {
          throw new Error('Product ID is missing in item');
        }
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found for ID: ${item.productId}`);
        }
        return {
          product: product._id,  // Correctly assign the product ObjectId here
          quantity: item.quantity,
          distributor: item.distributor,
          status: 'pending',
          productDetails: product, // Include product details for the email
        };
      })
    );

    console.log('Order items:', orderItems);

    const newOrder = new Order({
      userId,
      items: orderItems.map(item => ({
        product: item.product,  // Ensure the product ObjectId is included here
        quantity: item.quantity,
        distributor: item.distributor,
        status: 'pending',
      })),
      address,
      paymentMethod,
      totalPrice,
      createdAt: new Date(), 
    });

    console.log('New order:', newOrder);

    await newOrder.save();

    // Fetch user details for email
    const user = await User.findById(userId);

    // Prepare the order details for the email
    const orderDetails = orderItems.map(item => ({
      name: item.productDetails.name,
      quantity: item.quantity,
      price: item.productDetails.price,
      image: item.productDetails.images[0], // Assuming the first image is used
    }));

    // Send the confirmation email
    await sendEmail({
      email: user.email,
      subject: "Order Confirmation",
      message: `Thank you for your order! Here are the details:\n\n${orderDetails.map(d => `${d.name} - ${d.quantity} x $${d.price}`).join('\n')}`,
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order! Here are the details:</p>
        ${orderDetails.map(d => `
          <div>
            <img src="http://localhost:3001/${d.image}" alt="${d.name}" width="100" height="100" />
            <p>${d.name} - ${d.quantity} x $${d.price}</p>
          </div>
        `).join('')}
      `
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Update order status function with email notification
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

    // Fetch user details for email
    const user = await User.findById(order.userId);

    // Send the status update email
    await sendEmail({
      email: user.email,
      subject: "Order Status Update",
      message: `Your order status has been updated to "${status}".`,
      html: `
        <h1>Order Status Update</h1>
        <p>Your order status has been updated to "<strong>${status}</strong>".</p>
        <p>Item: ${item.product.name} - Quantity: ${item.quantity}</p>
      `,
    });

    res.json(order);
  } catch (error) {
    console.error('Failed to update item status:', error);
    res.status(500).json({ message: 'Failed to update item status', error: error.message });
  }
};