const Device = require("../models/device");
const Alert = require("../models/alert");
const nodemailer = require("nodemailer");

exports.sendDurationExceededAlert = async (req, res) => {
  try {
    const { device_id, duration } = req.body;

    // Find the device by device_id
    const device = await Device.findOne({ device_id }).populate("user_ids");

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Get the user emails associated with the device
    const userEmails = device.user_ids.map((user) => user.email);

    const transporter = nodemailer.createTransport({
      host: "mail.swordcodes.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SYSEMAIL,
        pass: process.env.SYSEMAILPASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Compose the email message
    const mailOptions = {
      from: process.env.SYSEMAIL,
      to: userEmails,
      subject: "Duration Exceeded Alert",
      text: `Device ID: ${device_id}\nDuration: ${duration} seconds`,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);

    // Create a new alert document
    const alert = new Alert({
      device_id,
      type: "duration_exceeded",
      message: `The device with ID ${device_id} has been opened for longer than the specified duration of ${device.max_duration} seconds.`,
    });

    await alert.save();

    res
      .status(200)
      .json({ message: "Duration exceeded alert sent successfully" });
  } catch (error) {
    console.error("Error sending duration exceeded alert:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error getting alerts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.clearAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({});
    res.status(200).json({ message: "Alerts cleared successfully" });
  } catch (error) {
    console.error("Error clearing alerts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error getting alerts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.clearAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({});
    res.status(200).json({ message: "Alerts cleared successfully" });
  } catch (error) {
    console.error("Error clearing alerts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
