const TrainingCycle = require("../models/trainingCycle");

exports.createTrainingCycle = async (req, res) => {
  try {
    const {
      device_id,
      temp_start,
      humi_start,
      target_temp,
      time_use,
      time_start,
      humi_end,
    } = req.body;

    const trainingCycle = new TrainingCycle({
      device_id,
      temp_start,
      humi_start,
      target_temp,
      time_use,
      time_start,
      humi_end,
    });

    await trainingCycle.save();

    res
      .status(201)
      .json({ message: "Training cycle created successfully", trainingCycle });
  } catch (error) {
    console.error("Error creating training cycle:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the training cycle" });
  }
};

exports.getAllTrainingCycles = async (req, res) => {
  try {
    const trainingCycles = await TrainingCycle.find();
    res.status(200).json(trainingCycles);
  } catch (error) {
    console.error("Error getting training cycles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the training cycles" });
  }
};

exports.getTrainingCyclesByDeviceId = async (req, res) => {
  try {
    const { device_id } = req.params;
    const trainingCycles = await TrainingCycle.find({ device_id });
    res.status(200).json(trainingCycles);
  } catch (error) {
    console.error("Error getting training cycles by device_id:", error);
    res.status(500).json({
      error: "An error occurred while getting the training cycles by device_id",
    });
  }
};

exports.clearAllTrainingCycles = async (req, res) => {
  try {
    await TrainingCycle.deleteMany({});
    res
      .status(200)
      .json({ message: "All training cycles cleared successfully" });
  } catch (error) {
    console.error("Error clearing training cycles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while clearing the training cycles" });
  }
};

exports.deleteTrainingCycleById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainingCycle = await TrainingCycle.findByIdAndDelete(id);

    if (!trainingCycle) {
      return res.status(404).json({ error: "Training cycle not found" });
    }

    res.status(200).json({ message: "Training cycle deleted successfully" });
  } catch (error) {
    console.error("Error deleting training cycle:", error);
    res.status(500).json({
      error: "An error occurred while deleting the training cycle",
    });
  }
};
