const Order = require('../models/Order'); // Ensure Order model is imported

const getDistributorStats = async (req, res) => {
  try {
    const distributorId = req.params.distributorId;

    // Fetch all orders that include items from this distributor
    const orders = await Order.find({ 'items.distributor': distributorId });

    let totalOrders = 0;
    let totalProducts = 0;
    let totalSales = 0;

    // Calculate the total orders, products, and sales for this distributor
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.distributor.toString() === distributorId) {
          totalOrders += 1;
          totalProducts += item.quantity;
          totalSales += item.quantity * item.product.price; // Assuming product price is available
        }
      });
    });

    res.status(200).json({ totalOrders, totalProducts, totalSales });
  } catch (error) {
    console.error('Error fetching distributor stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDistributorOrderStatuses = async (req, res) => {
  try {
    const distributorId = req.params.distributorId;

    // Fetch all orders that include items from this distributor
    const orders = await Order.find({ 'items.distributor': distributorId });

    const statusCounts = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        if (item.distributor.toString() === distributorId) {
          acc[item.status] = (acc[item.status] || 0) + 1;
        }
      });
      return acc;
    }, {});

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error('Error fetching distributor order statuses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDistributorStats, getDistributorOrderStatuses };
