const Device = require("../models/device");
const User = require("../models/user");
const Alert = require("../models/alert");
const nodemailer = require("nodemailer");

exports.sendDurationExceededAlert = async (req, res) => {
  try {
    const { device_id, duration } = req.body;

    const device = await Device.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (device.max_duration && duration > device.max_duration) {
      const userIds = device.user_ids;
      const users = await User.find({ _id: { $in: userIds } });
      const userEmails = users.map((user) => user.email);

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

      const mailOptions = {
        from: process.env.SYSEMAIL,
        to: userEmails,
        subject: "Device Duration Exceeded Alert",
        text: `The device with ID ${device_id} has been opened for longer than the specified duration of ${device.max_duration} seconds.`,
      };

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
        .json({ message: "Duration exceeded alert sent and stored" });
    } else {
      res.status(200).json({ message: "Duration within limits" });
    }
  } catch (error) {
    console.error("Error sending duration exceeded alert:", error);
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
