const latestData = {};

exports.getLatestData = (req, res) => {
  const deviceId = req.params.device_id;
  const data = latestData[deviceId];

  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ error: "Device not found" });
  }
};

exports.updateLatestData = (temperature, humidity, deviceId) => {
  latestData[deviceId] = { temperature, humidity };
};
