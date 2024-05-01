const TrainingCycle = require("../models/trainingCycle");

exports.createTrainingCycle = async (req, res) => {
  try {
    const { device_id, temp_start, humi_start, target_temp, time_use } =
      req.body;

    const trainingCycle = new TrainingCycle({
      device_id,
      temp_start,
      humi_start,
      target_temp,
      time_use,
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
    res
      .status(500)
      .json({
        error:
          "An error occurred while getting the training cycles by device_id",
      });
  }
};
