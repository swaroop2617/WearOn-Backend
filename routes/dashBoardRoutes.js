import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { getSalesData } from "../controllers/dashboardController.js";
import { getTopProducts,getOrderStatusStats, getCategoryStats, getCustomerSegments, getPaymentStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/sales", getSalesData);
router.get("/top-products", getTopProducts);
router.get("/order-status", getOrderStatusStats);
router.get("/category", getCategoryStats);
router.get("/category-stats", getCategoryStats);
router.get("/customer-segments", getCustomerSegments);
router.get("/payment-stats", getPaymentStats);

export default router;