const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

router.post("/register", deviceController.registerDevice);
router.put(
  "/:device_id/target-temperature",
  deviceController.updateTargetTemperature
);

router.get(
  "/:device_id/target-temperature",
  deviceController.getTargetTemperature
);

module.exports = router;
