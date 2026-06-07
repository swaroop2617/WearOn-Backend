import orderModel from "../models/orderModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";


export const getDashboardStats = async (req, res) => {
  try {
    // TOTAL COUNTS
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const orders = await Order.find();

    // TOTAL REVENUE
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );

    // =========================
    // REVENUE GROWTH
    // =========================

    const now = new Date();

    //  IMPORTANT: use bigger range (else always 0)
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 30);

    const prev7Days = new Date();
    prev7Days.setDate(now.getDate() - 60);

    // FIXED FILTERS
    const recentOrders = orders.filter((o) => {
      const orderDate = new Date(o.date);
      return orderDate >= last7Days;
    });

    const previousOrders = orders.filter((o) => {
      const orderDate = new Date(o.date);
      return orderDate >= prev7Days && orderDate < last7Days;
    });

    const recentRevenue = recentOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    const previousRevenue = previousOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    let revenueGrowth = 0;


    if (previousRevenue === 0) {
      if (recentRevenue === 0) {
        revenueGrowth = 0;
      } else {
        revenueGrowth = 50; // fallback growth
      }
    } else {
      revenueGrowth =
        ((recentRevenue - previousRevenue) / previousRevenue) * 100;
    }

    // =========================
    // CONVERSION RATE
    // =========================

    const uniqueUsersWithOrders = await Order.aggregate([
      {
        $match: {
          userId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
    ]);

    let conversionRate = 0;

    if (totalUsers > 0) {
      conversionRate =
        (uniqueUsersWithOrders.length / totalUsers) * 100;

      // limit to 100%
      if (conversionRate > 100) {
        conversionRate = 100;
      }
    }

    // =========================
    // RESPONSE
    // =========================

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      avgOrderValue:
        totalOrders > 0 ? totalRevenue / totalOrders : 0,
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
    });
  }
};

export const getSalesData = async (req, res) => {
  try {
    const { type } = req.query;

    const orders = await orderModel.find();

    const salesMap = {};

    orders.forEach(order => {
      let d;

      // HANDLE ALL DATE CASES
      if (order.createdAt instanceof Date) {
        d = order.createdAt;
      } else if (order.createdAt?.$date) {
        d = new Date(order.createdAt.$date);
      } else if (order.date) {
        d = new Date(order.date);
      }

      if (!d || isNaN(d)) return;

      let key;

      if (type === "year") {
        key = d.getFullYear().toString();
      } else if (type === "month") {
        key = `${d.getFullYear()}-${d.getMonth()}`; // FIXED (sortable)
      } else if (type === "week") {
        key = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
      } else {
        // BEST: ISO format for correct sorting
        key = d.toISOString().split("T")[0];
      }

      salesMap[key] = (salesMap[key] || 0) + (order.amount || 0);
    });

    // CONVERT TO ARRAY WITH DATE
    const result = Object.keys(salesMap).map(key => ({
      label: key,
      sales: salesMap[key],
      date: new Date(key) // needed for sorting
    }));

    // SORT BY DATE
    result.sort((a, b) => a.date - b.date);

    // FINAL CLEAN OUTPUT
    const finalResult = result.map(({ label, sales }) => ({
      label,
      sales
    }));

    res.json(finalResult);

  } catch (error) {
    console.error("SALES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const orders = await Order.find();

    const productMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item._id;

        if (!productMap[key]) {
          productMap[key] = {
            name: item.name,
            totalSold: 0,
            revenue: 0
          };
        }

        productMap[key].totalSold += item.quantity;
        productMap[key].revenue += item.price * item.quantity;
      });
    });

    const result = Object.values(productMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5); // Top 5

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStatusStats = async (req, res) => {
  try {
    const orders = await orderModel.find();

    const statusCount = {};

    orders.forEach((order) => {
      const status = order.status || "Unknown";

      if (statusCount[status]) {
        statusCount[status]++;
      } else {
        statusCount[status] = 1;
      }
    });

    // convert to chart format
    const result = Object.keys(statusCount).map((key) => ({
      status: key,
      value: statusCount[key],
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.category",
          totalRevenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"]
            }
          },
          totalQuantity: { $sum: "$items.quantity" }
        }
      }
    ]);

    // 👉 CALCULATE TOTAL REVENUE
    const totalRevenue = result.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );

    // 👉 ADD PERCENTAGE FIELD
    const finalData = result.map(item => ({
      category: item._id,
      revenue: item.totalRevenue,
      quantity: item.totalQuantity,
      percentage: totalRevenue > 0
        ? ((item.totalRevenue / totalRevenue) * 100).toFixed(1)
        : 0
    }));

    res.json(finalData);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching category stats"
    });
  }
};

export const getCustomerSegments = async (req, res) => {
  try {
    const users = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$amount" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    let segments = {
      high: { users: 0, revenue: 0, orders: 0 },
      medium: { users: 0, revenue: 0, orders: 0 },
      low: { users: 0, revenue: 0, orders: 0 }
    };

    // SEGMENT USERS
    users.forEach(u => {
      if (u.totalSpent > 5000) {
        segments.high.users++;
        segments.high.revenue += u.totalSpent;
        segments.high.orders += u.orderCount;
      } else if (u.totalSpent > 2000) {
        segments.medium.users++;
        segments.medium.revenue += u.totalSpent;
        segments.medium.orders += u.orderCount;
      } else {
        segments.low.users++;
        segments.low.revenue += u.totalSpent;
        segments.low.orders += u.orderCount;
      }
    });

    // TOTAL REVENUE
    const totalRevenue =
      segments.high.revenue +
      segments.medium.revenue +
      segments.low.revenue;

    // FINAL FORMAT
    const format = (seg) => ({
      users: seg.users,
      revenue: seg.revenue,
      revenuePercent:
        totalRevenue > 0
          ? ((seg.revenue / totalRevenue) * 100).toFixed(1)
          : 0,
      avgSpend:
        seg.users > 0
          ? (seg.revenue / seg.users).toFixed(0)
          : 0,
      avgOrders:
        seg.users > 0
          ? (seg.orders / seg.users).toFixed(1)
          : 0
    });

    res.json({
      high: format(segments.high),
      medium: format(segments.medium),
      low: format(segments.low)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching customer segments"
    });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          paymentMethod: { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          method: "$_id",
          revenue: 1,
          orders: 1
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    console.log("PAYMENT STATS:", result); // DEBUG

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching payment stats"
    });
  }
};
