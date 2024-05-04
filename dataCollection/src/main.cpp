#include <Adafruit_HTS221.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <time.h>

// Create an instance of the HTS221 sensor
Adafruit_HTS221 hts;

// Pin configuration
const int SCLpin = 40;
const int SDApin = 41;

// Server configuration
const char* serverUrl = "http://62.72.58.117:3000";

// Training cycle variables
unsigned long startTime;
bool targetReached = false;
float targetTemperature;
float startTemperature;
float startHumidity;
unsigned long timeUsed;
float endHumidity;

// WiFi credentials
const char* ssid = "The ou 2.4G";
const char* password = "0926269494";

// MQTT broker configuration
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* mqttTopic = "iot720ac/sensor/data";
const char* deviceId = "ou_bedroom";

// Create WiFi and MQTT clients
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  while (!Serial) {
    delay(10);
  }

  // Initialize I2C communication using custom pins
  Wire.begin(SDApin, SCLpin);

  // Initialize the HTS221 sensor
  if (!hts.begin_I2C()) {
    Serial.println("Failed to find HTS221 chip, check wiring!");
    while (1) {
      delay(10);
    }
  }
  Serial.println("HTS221 sensor ready!");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Set up MQTT client
  mqttClient.setServer(mqttServer, mqttPort);

  // Retrieve the target temperature from the server
  String targetTemperatureUrl = String(serverUrl) + "/devices/" + deviceId + "/target-temperature";
  HTTPClient http;
  http.begin(targetTemperatureUrl);
  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    DynamicJsonDocument jsonDoc(100);
    DeserializationError error = deserializeJson(jsonDoc, response);

    if (error) {
      Serial.print("Failed to parse JSON: ");
      Serial.println(error.c_str());
    } else {
      targetTemperature = jsonDoc["target_temperature"];
      Serial.print("Target temperature retrieved: ");
      Serial.println(targetTemperature);
    }
  } else {
    Serial.print("Failed to retrieve target temperature. HTTP response code: ");
    Serial.println(httpResponseCode);
  }

  http.end();

  // Record the start time and initial sensor readings
  startTime = millis();
  sensors_event_t temp_event, humidity_event;
  hts.getEvent(&humidity_event, &temp_event);
  startTemperature = temp_event.temperature;
  startHumidity = humidity_event.relative_humidity;
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
  if (temp_event.temperature <= targetTemperature && !targetReached) {
    timeUsed = (millis() - startTime) / 1000; // Calculate the time used in seconds
    endHumidity = humidity_event.relative_humidity;

    Serial.print("Target temperature reached in ");
    Serial.print(timeUsed);
    Serial.println(" seconds!");

    // Convert startTime to ISO 8601 format
    time_t rawtime = startTime / 1000;
    struct tm* timeinfo;
    char buffer[25];
    timeinfo = gmtime(&rawtime);
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", timeinfo);
    String isoTime = String(buffer);

    // Create a JSON object for the training cycle data
    DynamicJsonDocument trainingCycleDoc(300);
    trainingCycleDoc["device_id"] = deviceId;
    trainingCycleDoc["temp_start"] = startTemperature;
    trainingCycleDoc["humi_start"] = startHumidity;
    trainingCycleDoc["target_temp"] = targetTemperature;
    trainingCycleDoc["time_use"] = timeUsed;
    trainingCycleDoc["time_start"] = isoTime;
    trainingCycleDoc["humi_end"] = endHumidity;

    // Serialize the training cycle JSON object to a string
    String trainingCycleString;
    serializeJson(trainingCycleDoc, trainingCycleString);

    // Send the training cycle data to the server
    String trainingCycleUrl = String(serverUrl) + "/training-cycles";
    HTTPClient http;
    http.begin(trainingCycleUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(trainingCycleString);

    if (httpResponseCode == 201) {
      Serial.println("Training cycle data sent successfully");
    } else {
      Serial.print("Failed to send training cycle data. HTTP response code: ");
      Serial.println(httpResponseCode);
    }

    http.end();

    targetReached = true;
  }

  // Delay between readings
  delay(10000); // Send data every 10 seconds
}
