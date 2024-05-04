const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.registerUser = async (req, res) => {
  try {
    const { email, password, username, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const confirmationToken = jwt.sign(
      { email, password: hashedPassword, username, name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

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
      to: email,
      subject: "Email Confirmation for OUIOT",
      html: `
          <p>Please click the following link to confirm your email:</p>
          <a href="http://${process.env.HOST}:${process.env.PORT}/users/confirm-email?token=${confirmationToken}">Confirm Email</a>
        `,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: "Confirmation email sent. Please check your email." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { email, password, username, name } = decodedToken;

    const newUser = new User({
      email,
      password,
      username,
      name,
      isEmailConfirmed: true,
    });

    await newUser.save();
    es.status(200).json({
      message: "Email confirmed and user registered successfully",
    });
  } catch (error) {
    console.error("Error confirming email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
