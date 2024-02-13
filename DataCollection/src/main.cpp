#include <Wire.h>
#include <Adafruit_HTS221.h>

// Create an instance of the HTS221 sensor
Adafruit_HTS221 hts;

const int SCLpin = 40;
const int SDApin = 41;

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

  // Wait a bit before reading again
  delay(2000);
}