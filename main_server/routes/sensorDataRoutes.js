const express = require("express");
const router = express.Router();
const sensorDataController = require("../controllers/sensorDataController");

router.get("/latestData/:device_id", sensorDataController.getLatestData);

module.exports = router;
