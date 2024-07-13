const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getDistributorStats = async (req, res) => {
  try {
    const distributorId = req.params.distributorId;
    console.log(`Fetching orders for distributor: ${distributorId}`);

    const totalOrders = await Order.countDocuments({ 'items.distributor': distributorId });

    const totalProducts = await Product.countDocuments({ distributor: distributorId });

    const totalSalesResult = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.distributor': distributorId } },
      { $group: { _id: null, total: { $sum: '$items.price' } } },
      { $project: { _id: 0, total: 1 } }
    ]);

    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    res.json({
      totalOrders,
      totalProducts,
      totalSales
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
