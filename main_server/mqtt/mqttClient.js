const mqtt = require("mqtt");
const sensorDataController = require("../controllers/sensorDataController");

// MQTT broker configuration
const brokerUrl = "mqtt://broker.hivemq.com:1883";
const clientId = "main-server";

const client = mqtt.connect(brokerUrl, { clientId });

client.on("connect", () => {
  console.log("MQTT Client Connected");
  client.subscribe("iot720ac/sensor/data", function (err) {
    if (!err) {
      console.log("Subscribed to topic 'iot720ac/sensor/data'");
    } else {
      console.error("Subscription error:", err);
    }
  });
});

client.on("message", (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
  // Process the received data
  if (topic === "iot720ac/sensor/data") {
    try {
      const data = JSON.parse(message.toString());
      const { temperature, humidity, device_id } = data;
      console.log(`Temperature: ${temperature}`);
      console.log(`Humidity: ${humidity}`);
      console.log(`Device ID: ${device_id}`);

      // Update the latest data for the device
      sensorDataController.updateLatestData(temperature, humidity, device_id);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
});

// Handle disconnection event
client.on("close", () => {
  console.log("Disconnected from MQTT broker");
});

// Handle error event
client.on("error", (error) => {
  console.error("MQTT error:", error);
});

module.exports = client;
