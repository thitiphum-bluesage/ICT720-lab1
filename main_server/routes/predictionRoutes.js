const express = require("express");
const router = express.Router();
const predictionController = require("../controllers/predictionController");

router.post("/", predictionController.predict);

module.exports = router;
