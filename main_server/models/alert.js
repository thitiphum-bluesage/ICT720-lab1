const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
