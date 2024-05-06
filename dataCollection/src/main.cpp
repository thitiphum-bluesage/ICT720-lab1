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
unsigned long maxDuration = 0;
bool durationAlertSent = false;


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

void connectToWiFi() {
    WiFi.begin(ssid, password);
    Serial.println("Connecting to WiFi...");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
        retries++;
        if (retries > 30) { // 30 seconds timeout
            Serial.println("Failed to connect to WiFi. Please check your settings.");
            return;
        }
    }
    Serial.println("\nConnected to WiFi");
}

void connectToMQTT() {
    mqttClient.setServer(mqttServer, mqttPort);
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

void setup() {
    Serial.begin(115200);
    while (!Serial) {
        delay(10);
    }

    Wire.begin(SDApin, SCLpin);

    if (!hts.begin_I2C()) {
        Serial.println("Failed to find HTS221 chip, check wiring!");
        while (1) {
            delay(10);
        }
    }
    Serial.println("HTS221 sensor ready!");

    connectToWiFi();

    connectToMQTT();

    HTTPClient http;
    String targetTemperatureUrl = String(serverUrl) + "/devices/" + deviceId + "/target-temperature";
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

    String maxDurationUrl = String(serverUrl) + "/devices/" + deviceId + "/max-duration";
    http.begin(maxDurationUrl);
    httpResponseCode = http.GET();
    if (httpResponseCode == 200) {
        String response = http.getString();
        DynamicJsonDocument jsonDoc(100);
        DeserializationError error = deserializeJson(jsonDoc, response);
        if (error) {
            Serial.print("Failed to parse JSON: ");
            Serial.println(error.c_str());
        } else {
            if (!jsonDoc["max_duration"].isNull()) {
                maxDuration = jsonDoc["max_duration"]; // Assign the retrieved value to maxDuration
                Serial.print("Max duration retrieved: ");
                Serial.println(maxDuration);
            } else {
                Serial.println("Max duration is null");
            }
        }
    } else {
        Serial.print("Failed to retrieve max duration. HTTP response code: ");
        Serial.println(httpResponseCode);
    }
    http.end();

    configTime(0, 0, "pool.ntp.org");
    while (time(nullptr) < 1618000000) {
        delay(1000);
    }

    startTime = time(nullptr);
    sensors_event_t temp_event, humidity_event;
    hts.getEvent(&humidity_event, &temp_event);
    startTemperature = temp_event.temperature;
    startHumidity = humidity_event.relative_humidity;

    Serial.print("Start time (Unix timestamp): ");
    Serial.println(startTime);
}

void loop() {
    if (!mqttClient.connected()) {
        connectToMQTT();
    }
    mqttClient.loop();

    sensors_event_t temp_event, humidity_event;
    hts.getEvent(&humidity_event, &temp_event);

    Serial.println("Sensor readings: ");
    Serial.print("Temperature: ");
    Serial.println(temp_event.temperature);
    Serial.print("Humidity: ");
    Serial.println(humidity_event.relative_humidity);

    DynamicJsonDocument jsonDoc(200);
    jsonDoc["temperature"] = temp_event.temperature;
    jsonDoc["humidity"] = humidity_event.relative_humidity;
    jsonDoc["device_id"] = deviceId;

    String jsonString;
    serializeJson(jsonDoc, jsonString);

    mqttClient.publish(mqttTopic, jsonString.c_str());

    unsigned long currentTime = time(nullptr);
    timeUsed = (currentTime - startTime);

    if (temp_event.temperature <= targetTemperature && !targetReached) {
        unsigned long currentTime = time(nullptr);
        
        endHumidity = humidity_event.relative_humidity;

        Serial.print("Target temperature reached in ");
        Serial.print(timeUsed);
        Serial.println(" seconds!");

        DynamicJsonDocument trainingCycleDoc(300);
        trainingCycleDoc["device_id"] = deviceId;
        trainingCycleDoc["temp_start"] = startTemperature;
        trainingCycleDoc["humi_start"] = startHumidity;
        trainingCycleDoc["target_temp"] = targetTemperature;
        trainingCycleDoc["time_use"] = timeUsed;
        trainingCycleDoc["time_start"] = String(startTime);
        trainingCycleDoc["humi_end"] = endHumidity;

        String trainingCycleString;
        serializeJson(trainingCycleDoc, trainingCycleString);

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

    if (timeUsed >= maxDuration && maxDuration > 0 && !durationAlertSent)  {
        // Send duration exceeded alert to the server
        DynamicJsonDocument alertDoc(200);
        alertDoc["device_id"] = deviceId;
        alertDoc["duration"] = timeUsed;

        String alertString;
        serializeJson(alertDoc, alertString);

        String alertUrl = String(serverUrl) + "/alerts/duration-exceeded";
        HTTPClient http;
        http.begin(alertUrl);
        http.addHeader("Content-Type", "application/json");
        int httpResponseCode = http.POST(alertString);

        if (httpResponseCode == 200) {
            Serial.println("Duration exceeded alert sent successfully");
            durationAlertSent = true; 
        } else {
            Serial.print("Failed to send duration exceeded alert. HTTP response code: ");
            Serial.println(httpResponseCode);
        }
        http.end();
    }

    delay(10000); // Delay between readings
}
