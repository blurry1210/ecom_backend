const { sendEmail } = require('../utils/sendEmail');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

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

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, totalPrice } = req.body;
    const userId = req.user._id;

    console.log('Received order creation request:', req.body);

    const orderItems = await Promise.all(
      items.map(async (item) => {
        if (!item.productId) {
          throw new Error('Product ID is missing in item');
        }
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(`Product not found for ID: ${item.productId}`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        product.quantity -= item.quantity;
        await product.save();

        return {
          product: product._id,
          quantity: item.quantity,
          distributor: item.distributor,
          status: 'pending',
          productDetails: product,
        };
      })
    );

    console.log('Order items:', orderItems);

    const newOrder = new Order({
      userId,
      items: orderItems.map(item => ({
        product: item.product,
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

    const user = await User.findById(userId);

    const orderDetails = orderItems.map(item => ({
      name: item.productDetails.name,
      description: item.productDetails.description,
      quantity: item.quantity,
      price: item.productDetails.price,
      category: item.productDetails.category,
      subcategory: item.productDetails.subcategory,
    }));

    await sendEmail({
      email: user.email,
      subject: "Order Confirmation",
      message: `
        Thank you for your order! Here are the details:
        \n
        ${orderDetails.map(d => `
          Product: ${d.name} (${d.category} - ${d.subcategory})
          Quantity: ${d.quantity} x $${d.price}
        `).join('\n')}
        \n
        Order Information:
        Name: ${address.firstName} ${address.lastName}
        Phone Number: ${address.phoneNumber}
        Delivery Address: ${address.addressLine}, ${address.city}, ${address.postalCode}, ${address.country}
        Payment Method: ${paymentMethod}
        Total Price: $${totalPrice}
      `,
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order! Here are the details:</p>
        ${orderDetails.map(d => `
          <div>
            <h3>Product: ${d.name} (${d.category} - ${d.subcategory})</h3>
            <p>Quantity: ${d.quantity} x $${d.price}</p>
          </div>
        `).join('')}
        <h2>Order Information:</h2>
        <p><strong>Name:</strong> ${address.firstName} ${address.lastName}</p>
        <p><strong>Phone Number:</strong> ${address.phoneNumber}</p>
        <p><strong>Delivery Address:</strong> ${address.addressLine}, ${address.city}, ${address.postalCode}, ${address.country}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Total Price:</strong> $${totalPrice}</p>
      `
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};


exports.updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = status;
    await order.save();

    const user = await User.findById(order.userId);

    await sendEmail({
      email: user.email,
      subject: "Order Status Update",
      message: `
        Your order status has been updated to "${status}".
        \n
        Product: ${item.product.name}
        Quantity: ${item.quantity}
        Category: ${item.product.category} - ${item.product.subcategory}
        \n
        Order Information:
        Name: ${order.address.firstName} ${order.address.lastName}
        Phone Number: ${order.address.phoneNumber}
        Delivery Address: ${order.address.addressLine}, ${order.address.city}, ${order.address.postalCode}, ${order.address.country}
        Payment Method: ${order.paymentMethod}
        Total Price: $${order.totalPrice}
      `,
      html: `
        <h1>Order Status Update</h1>
        <p>Your order status has been updated to "<strong>${status}</strong>".</p>
        <h3>Product Details:</h3>
        <p><strong>Product:</strong> ${item.product.name}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
        <p><strong>Category:</strong> ${item.product.category} - ${item.product.subcategory}</p>
        <h2>Order Information:</h2>
        <p><strong>Name:</strong> ${order.address.firstName} ${order.address.lastName}</p>
        <p><strong>Phone Number:</strong> ${order.address.phoneNumber}</p>
        <p><strong>Delivery Address:</strong> ${order.address.addressLine}, ${order.address.city}, ${order.address.postalCode}, ${order.address.country}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Total Price:</strong> $${order.totalPrice}</p>
      `
    });

    res.json(order);
  } catch (error) {
    console.error('Failed to update item status:', error);
    res.status(500).json({ message: 'Failed to update item status', error: error.message });
  }
};
