const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");

router.post("/duration-exceeded", alertController.sendDurationExceededAlert);
router.get("/", alertController.getAlerts);

module.exports = router;
