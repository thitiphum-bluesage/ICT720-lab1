const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const mqttClient = require("./mqtt/mqttClient");
const trainingCycleRoutes = require("./routes/trainingCycleRoutes");
const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const alertRoutes = require("./routes/alertRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(morgan("dev"));
app.use(cors());
const mongoURI = process.env.DB_URL;

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => console.error("Connection error", err));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/training-cycles", trainingCycleRoutes);
app.use("/users", userRoutes);
app.use("/devices", deviceRoutes);
app.use("/alerts", alertRoutes);
app.use("/predict", predictionRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
