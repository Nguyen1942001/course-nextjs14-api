const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { AuthPermission } = require("../middleware/AuthPermission");
const { CONFIG_PERMISSIONS } = require("../configs");

router.post(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_PRODUCT.PRODUCT.CREATE),
  ProductController.createProduct
);

router.put(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_PRODUCT.PRODUCT.UPDATE),
  ProductController.updateProduct
);

router.get("/public/:id", ProductController.getDetailsProductPublic);

router.get(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_PRODUCT.PRODUCT.VIEW),
  ProductController.getDetailsProduct
);

router.delete(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_PRODUCT.PRODUCT.DELETE),
  ProductController.deleteProduct
);

router.get("/public", ProductController.getAllProductPublic);

router.get(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_PRODUCT.PRODUCT.VIEW),
  ProductController.getAllProduct
);

router.post("/like", AuthPermission("", true), ProductController.likeProduct);

router.post(
  "/unlike",
  AuthPermission("", true),
  ProductController.unlikeProduct
);

router.delete(
  "/delete-many",
  AuthPermission(CONFIG_PERMISSIONS.MANAGE_PRODUCT.PRODUCT.DELETE),
  ProductController.deleteMany
);

module.exports = router;
