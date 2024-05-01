#include <Adafruit_HTS221.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Create an instance of the HTS221 sensor
Adafruit_HTS221 hts;

const int SCLpin = 40;
const int SDApin = 41;

unsigned long startTime; // Variable to store the start time
bool targetReached = false; // Flag to track if target temperature is reached

// WiFi credentials
const char* ssid = "The ou 2.4G";
const char* password = "0926269494";

// MQTT broker configuration
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* mqttTopic = "iot720ac/sensor/data";
const char* deviceId = "ou_bedroom";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  // Wait for serial monitor to open on native USB devices
  while (!Serial) {
    delay(10);
  }

  // Initialize I2C communication using custom pins
  Wire.begin(SDApin, SCLpin);

  // Initialize the HTS221 sensor
  if (!hts.begin_I2C()) {
    // Failed to find HTS221 chip, halt here
    Serial.println("Failed to find HTS221 chip, check wiring!");
    while (1) {
      delay(10);
    }
  }
  Serial.println("HTS221 sensor ready!");
  Serial.println("Target temperature: 28.0");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set up MQTT client
  mqttClient.setServer(mqttServer, mqttPort);

  startTime = millis(); // Record the start time
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.println("Connecting to MQTT...");
    if (mqttClient.connect(deviceId)) {
      Serial.println("Connected to MQTT");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Read temperature and humidity data
  sensors_event_t temp_event, humidity_event;
  hts.getEvent(&humidity_event, &temp_event);

  Serial.println("Sensor readings: ");

  // Print the temperature and humidity data
  Serial.print("Temperature: ");
  Serial.println(temp_event.temperature);

  Serial.print("Humidity: ");
  Serial.println(humidity_event.relative_humidity);

  // Create a JSON object to store the sensor data
  DynamicJsonDocument jsonDoc(200);
  jsonDoc["temperature"] = temp_event.temperature;
  jsonDoc["humidity"] = humidity_event.relative_humidity;
  jsonDoc["device_id"] = deviceId;

  // Serialize the JSON object to a string
  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Publish the JSON string to the MQTT topic
  mqttClient.publish(mqttTopic, jsonString.c_str());

  // Check if the target temperature has been reached
  if (temp_event.temperature <= 28.0 && !targetReached) {
    unsigned long elapsedTime = (millis() - startTime) / 1000; // Calculate the elapsed time in seconds

    Serial.print("Target temperature reached in ");
    Serial.print(elapsedTime);
    Serial.println(" seconds!");

    targetReached = true;
  }

  // Delay between readings
  delay(10000); // Send data every 10 seconds
}
