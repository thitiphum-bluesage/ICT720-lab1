const mongoose = require("mongoose");

const trainingCycleSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
  },
  temp_start: {
    type: Number,
    required: true,
  },
  humi_start: {
    type: Number,
    required: true,
  },
  target_temp: {
    type: Number,
    required: true,
  },
  time_use: {
    type: Number,
    required: true,
  },
  time_start: {
    type: Date,
    required: true,
  },
  humi_end: {
    type: Number,
    required: true,
  },
});

const TrainingCycle = mongoose.model("TrainingCycle", trainingCycleSchema);

module.exports = TrainingCycle;
