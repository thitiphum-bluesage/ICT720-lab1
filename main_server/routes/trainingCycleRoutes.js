const express = require("express");
const router = express.Router();
const trainingCycleController = require("../controllers/trainingCycleController");

router.post("/", trainingCycleController.createTrainingCycle);
router.get("/", trainingCycleController.getAllTrainingCycles);
router.get("/:device_id", trainingCycleController.getTrainingCyclesByDeviceId);
router.delete("/clear", trainingCycleController.clearAllTrainingCycles);

module.exports = router;
