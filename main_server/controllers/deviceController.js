const Device = require("../models/device");
const User = require("../models/user");

exports.registerDevice = async (req, res) => {
  try {
    const { device_id, description, target_temperature, user_id } = req.body;

    const existingDevice = await Device.findOne({ device_id });
    if (existingDevice) {
      return res.status(400).json({ message: "Device already exists" });
    }

    const newDevice = new Device({
      device_id,
      description,
      target_temperature,
      user_ids: [user_id],
    });

    await newDevice.save();
    res.status(201).json({ message: "Device registered successfully" });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a device by device_id
exports.getDevice = async (req, res) => {
  try {
    const { device_id } = req.params;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json(device);
  } catch (error) {
    console.error("Error getting device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a device by device_id
exports.updateDevice = async (req, res) => {
  try {
    const { device_id } = req.params;
    const { description, target_temperature, user_ids, max_duration } =
      req.body;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    device.description = description || device.description;
    device.target_temperature = target_temperature || device.target_temperature;
    device.user_ids = user_ids || device.user_ids;
    device.max_duration =
      max_duration !== undefined ? max_duration : device.max_duration;

    await device.save();

    res.status(200).json({ message: "Device updated successfully" });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    const { device_id } = req.params;

    const device = await Device.findOneAndDelete({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Error deleting device:", error);
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

exports.updateMaxDuration = async (req, res) => {
  try {
    const { device_id } = req.params;
    const { max_duration } = req.body;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    device.max_duration = max_duration !== undefined ? max_duration : null;
    await device.save();

    res.status(200).json({ message: "Max duration updated successfully" });
  } catch (error) {
    console.error("Error updating max duration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMaxDuration = async (req, res) => {
  try {
    const { device_id } = req.params;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ max_duration: device.max_duration });
  } catch (error) {
    console.error("Error getting max duration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const latestData = {};

exports.getLatestData = (req, res) => {
  const deviceId = req.params.device_id;
  const data = latestData[deviceId];
  console.log("Retrieved data:", data);

  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ error: "Device not found" });
  }
};

exports.updateLatestData = (temperature, humidity, deviceId) => {
  latestData[deviceId] = { temperature, humidity };
};

exports.addUserToDevice = async (req, res) => {
  try {
    const { device_id } = req.params;
    const { user_id } = req.body;

    console.log("Device ID:", device_id);
    console.log("User ID:", user_id);

    const device = await Device.findOne({ device_id });
    console.log("Device:", device);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const user = await User.findById(user_id);
    console.log("User:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (device.user_ids.includes(user_id)) {
      return res
        .status(400)
        .json({ message: "User already added to the device" });
    }

    device.user_ids.push(user_id);
    await device.save();

    res.status(200).json({ message: "User added to the device successfully" });
  } catch (error) {
    console.error("Error adding user to device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
