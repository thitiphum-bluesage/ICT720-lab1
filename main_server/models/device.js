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
  target_temperature: {
    type: Number,
    required: true,
  },
  user_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  max_duration: {
    type: Number,
    default: null,
  },
});

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;
