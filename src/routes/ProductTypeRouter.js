const express = require("express");
const router = express.Router();
const ProductTypeController = require("../controllers/ProductTypeController");
const { AuthPermission } = require("../middleware/AuthPermission");
const { CONFIG_PERMISSIONS } = require("../configs");

router.post(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.PRODUCT.PRODUCT_TYPE.CREATE),
  ProductTypeController.createProductType
);

router.put(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.PRODUCT.PRODUCT_TYPE.UPDATE),
  ProductTypeController.updateProductType
);

router.get(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.PRODUCT.PRODUCT_TYPE.VIEW),
  ProductTypeController.getDetailsProductType
);

router.delete(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.PRODUCT.PRODUCT_TYPE.DELETE),
  ProductTypeController.deleteProductType
);

router.get(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.PRODUCT.PRODUCT_TYPE.VIEW),
  ProductTypeController.getAllProductType
);

router.delete(
  "/delete-many",
  AuthPermission(CONFIG_PERMISSIONS.PRODUCT.PRODUCT_TYPE.DELETE),
  ProductTypeController.deleteManyProductType
);

module.exports = router;
