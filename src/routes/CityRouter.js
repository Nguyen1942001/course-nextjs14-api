const express = require("express");
const router = express.Router();
const { CONFIG_PERMISSIONS } = require("../configs");
const { AuthPermission } = require("../middleware/AuthPermission");
const CityController = require("../controllers/CityController");

router.post(
  "/",
  AuthPermission(CONFIG_PERMISSIONS.CITY.CREATE),
  CityController.createCity
);

router.put(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.CITY.UPDATE),
  CityController.updateCity
);

router.get("/:id", CityController.getDetailsCity);

router.delete(
  "/:id",
  AuthPermission(CONFIG_PERMISSIONS.CITY.DELETE),
  CityController.deleteCity
);

router.get("/", CityController.getAllCity);

router.delete(
  "/delete-many",
  AuthPermission(CONFIG_PERMISSIONS.CITY.DELETE),
  CityController.deleteMany
);

module.exports = router;
