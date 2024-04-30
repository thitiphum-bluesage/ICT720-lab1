#include <Adafruit_HTS221.h>
#include <Wire.h>

// Create an instance of the HTS221 sensor
Adafruit_HTS221 hts;

const int SCLpin = 40;
const int SDApin = 41;

unsigned long startTime; // Variable to store the start time

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
  Serial.println("target temperature: 28.0");

  startTime = millis(); // Record the start time
}

void loop()
{
  // Read temperature and humidity data
  sensors_event_t temp_event, humidity_event;
  hts.getEvent(&humidity_event, &temp_event);

  Serial.println("Sensor readings: ");

  // Print the temperature and humidity data
  Serial.print("Temperature: ");
  Serial.println(temp_event.temperature);

  Serial.print("Humidity: ");
  Serial.println(humidity_event.relative_humidity);

  // Check if the target temperature has been reached
  if (temp_event.temperature <= 28.0)
  {
    unsigned long endTime = millis(); // Record the end time
    unsigned long elapsedTime = (endTime - startTime) / 1000; // Calculate the elapsed time in seconds

    Serial.print("Target temperature reached in ");
    Serial.print(elapsedTime);
    Serial.println(" seconds!");

    // Stop the board
    while (1)
    {
      delay(1000);
    }
  }

  // Delay between readings
  delay(2000); // Adjust the delay as needed
}
