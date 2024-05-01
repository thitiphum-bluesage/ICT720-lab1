const express = require("express");
const router = express.Router();
const trainingCycleController = require("../controllers/trainingCycleController");

router.post("/", trainingCycleController.createTrainingCycle);
router.get("/", trainingCycleController.getAllTrainingCycles);
router.get("/:device_id", trainingCycleController.getTrainingCyclesByDeviceId);

module.exports = router;
