const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

router.post("/register", deviceController.registerDevice);
router.get("/:device_id", deviceController.getDevice);
router.put("/:device_id", deviceController.updateDevice);
router.put(
  "/:device_id/target-temperature",
  deviceController.updateTargetTemperature
);
router.get(
  "/:device_id/target-temperature",
  deviceController.getTargetTemperature
);
router.put("/:device_id/max-duration", deviceController.updateMaxDuration);
router.get("/:device_id/max-duration", deviceController.getMaxDuration);

router.get("/latestData/:device_id", deviceController.getLatestData);

module.exports = router;
