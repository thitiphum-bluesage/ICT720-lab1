const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

router.post("/register", deviceController.registerDevice);
router.get("/:device_id", deviceController.getDevice);
router.put("/:device_id", deviceController.updateDevice);
router.delete("/:device_id", deviceController.deleteDevice);

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

router.post("/:device_id/users", deviceController.addUserToDevice);
router.get("/user/:userId", deviceController.getDevicesByUserId);

module.exports = router;
