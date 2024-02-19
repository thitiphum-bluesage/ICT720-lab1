#include <Wire.h>
#include <WiFi.h>
#include <Adafruit_HTS221.h>
#include <ArduinoJson.h>
#include <FirebaseESP32.h>

// Include the token generation and RTDB payload handling helpers
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// Create an instance of the HTS221 sensor
Adafruit_HTS221 hts;

const int SCLpin = 40;
const int SDApin = 41;

const char* ssid = "God Ou"; 
const char* password = "God Ou"; 

// Firebase project details.
const char* DATABASE_URL = "God Ou";
const char* API_KEY  = "God Ou";

const char* USER_EMAIL = "God Ou";
const char* USER_PASSWORD = "God Ou";

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup()
{
  // Initialize serial communication
  Serial.begin(115200);
  // Wait for serial monitor to open on native USB devices
  while (!Serial)
  {
    delay(10);
  }

  // Initialize I2C communication using custom pins
  Wire.begin(SDApin, SCLpin);

  // Initialize the HTS221 sensor
  if (!hts.begin_I2C())
  {
    // Failed to find HTS221 chip, halt here
    Serial.println("Failed to find HTS221 chip, check wiring!");
    while (1)
    {
      delay(10);
    }
  }
  Serial.println("HTS221 sensor ready!");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi..");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Connected to the WiFi network");

  // Configure Firebase settings
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Initialize Firebase
  Firebase.begin(&config,&auth);
  Firebase.reconnectWiFi(true); // Maintain WiFi connection
}

void loop()
{
  // Read temperature and humidity data
  sensors_event_t temp_event, humidity_event;
  hts.getEvent(&humidity_event, &temp_event);

  // Print the temperature and humidity data
  Serial.print("Temperature: ");
  Serial.print(temp_event.temperature);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(humidity_event.relative_humidity);
  Serial.println(" %");

  // Prepare a JSON object for Firebase
  FirebaseJson json;
  json.set("temperature", temp_event.temperature);
  json.set("humidity", humidity_event.relative_humidity);
  json.set("timestamp/.sv", "timestamp");  // Use server value for timestamp

  // Path where the data will be stored in Firebase
  String path = "/sensorData";

  // Send data to Firebase
    if (Firebase.pushJSON(fbdo, path, json)) {
        Serial.println("Data sent to Firebase");
    } else {
        Serial.println("Failed to send data to Firebase");
        Serial.println(fbdo.errorReason());
    }
  // Send data every 20 seconds
  delay(20000);
}