const Device = require("../models/device");

exports.registerDevice = async (req, res) => {
  try {
    const { device_id, description, target_temperature, username } = req.body;

    const existingDevice = await Device.findOne({ device_id });
    if (existingDevice) {
      return res.status(400).json({ message: "Device already exists" });
    }

    const newDevice = new Device({
      device_id,
      description,
      target_temperature,
      username,
    });

    await newDevice.save();
    res.status(201).json({ message: "Device registered successfully" });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateTargetTemperature = async (req, res) => {
  try {
    const { device_id } = req.params;
    const { target_temperature } = req.body;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    device.target_temperature = target_temperature;
    await device.save();

    res
      .status(200)
      .json({ message: "Target temperature updated successfully" });
  } catch (error) {
    console.error("Error updating target temperature:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTargetTemperature = async (req, res) => {
  try {
    const { device_id } = req.params;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ target_temperature: device.target_temperature });
  } catch (error) {
    console.error("Error getting target temperature:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
