const express = require("express");
const mongoose = require("mongoose");
const mqttClient = require("./mqtt/mqttClient");
const sensorDataRoutes = require("./routes/sensorDataRoutes");
require("dotenv").config();

const app = express();

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

app.use("/device", sensorDataRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
