const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");
const { AuthPermission } = require("../middleware/AuthPermission");
const { CONFIG_PERMISSIONS } = require("../configs");

router.post("/", ReviewController.createReview);

router.put(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.REVIEW.UPDATE),
  ReviewController.updateReview
);

router.get("/:id", ReviewController.getDetailsReview);

router.delete(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.REVIEW.DELETE),
  ReviewController.deleteReview
);

router.get("/", ReviewController.getAllReview);

router.delete(
  "/delete-many",
  AuthPermission(CONFIG_PERMISSIONS.REVIEW.DELETE),
  ReviewController.deleteMany
);

module.exports = router;
