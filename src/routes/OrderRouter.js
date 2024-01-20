const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");
const { AuthPermission } = require("../middleware/AuthPermission");
const { CONFIG_PERMISSIONS } = require("../configs");

router.post(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_ORDER.ORDER.CREATE),
  OrderController.createOrder
);

router.get(
  "/all",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_ORDER.ORDER.VIEW),
  OrderController.getAllOrder
);

router.get(
  "/:orderId",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_ORDER.ORDER.VIEW),
  OrderController.getDetailsOrder
);

router.delete(
  "/cancel-order/:orderId",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_ORDER.ORDER.DELETE),
  OrderController.cancelOrderDetails
);

router.get(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_ORDER.ORDER.VIEW),
  OrderController.getAllOrderMe
);

module.exports = router;
