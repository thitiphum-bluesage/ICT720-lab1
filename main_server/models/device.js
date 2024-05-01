const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;
