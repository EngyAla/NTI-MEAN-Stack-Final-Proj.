const Category = require('../models/Category');
const Item = require('../models/Item');
const Order = require('../models/Order');

/**
 * @desc    Get dashboard metrics & summary
 * @route   GET /api/dashboard/stats
 * @access  Private (Manager only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalCategories, totalItems, totalOrders, openedOrders, closedOrders, recentOrders] =
      await Promise.all([
        Category.countDocuments(),
        Item.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'opened' }),
        Order.countDocuments({ status: 'closed' }),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .select('orderNumber customer.fullName customer.phone totalPrice status createdAt'),
      ]);

    // Aggregate total revenue from closed orders (or all orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'closed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalClosedRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const allRevenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalPipelineRevenue = allRevenueAgg.length > 0 ? allRevenueAgg[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        totalItems,
        totalOrders,
        openedOrders,
        closedOrders,
        totalClosedRevenue,
        totalPipelineRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
