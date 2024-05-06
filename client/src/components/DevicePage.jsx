import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

function DevicePage() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [latestData, setLatestData] = useState({
    temperature: null,
    humidity: null,
  });
  const [targetTemperature, setTargetTemperature] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchDevice();
    } else {
      navigate("/login");
    }

    const interval = setInterval(() => {
      fetchLatestData();
    }, 2000);

    return () => clearInterval(interval);
  }, [deviceId, navigate]);

  const fetchDevice = async () => {
    try {
      if (deviceId) {
        const deviceID = deviceId.toString();
        const response = await axios.get(
          `http://62.72.58.117:3000/devices/${deviceID}`
        );
        console.log("Response data:", response.data);
        if (response.data.device_id === deviceID) {
          setDevice(response.data);
          setTargetTemperature(response.data.target_temperature);
          setMaxDuration(response.data.max_duration);
        } else {
          setDevice(null);
        }
      } else {
        setDevice(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching device:", error);
      setLoading(false);
    }
  };

  const fetchLatestData = async () => {
    try {
      const response = await axios.get(
        `http://62.72.58.117:3000/devices/latestData/${deviceId}`
      );
      setLatestData(response.data);
    } catch (error) {
      console.error("Error fetching latest data:", error);
    }
  };

  const handleUpdateTargetTemperature = async () => {
    try {
      await axios.put(
        `http://62.72.58.117:3000/devices/${deviceId}/target-temperature`,
        {
          target_temperature: targetTemperature,
        }
      );
      fetchDevice();
    } catch (error) {
      console.error("Error updating target temperature:", error);
    }
  };

  const handleUpdateMaxDuration = async () => {
    try {
      await axios.put(
        `http://62.72.58.117:3000/devices/${deviceId}/max-duration`,
        {
          max_duration: maxDuration !== "" ? maxDuration : null,
        }
      );
      fetchDevice();
    } catch (error) {
      console.error("Error updating max duration:", error);
    }
  };

  const handleSetMaxDurationToNull = async () => {
    if (window.confirm("Are you sure you want to set Max Duration to null?")) {
      try {
        await axios.put(
          `http://62.72.58.117:3000/devices/${deviceId}/max-duration`,
          {
            max_duration: null,
          }
        );
        fetchDevice();
        setMaxDuration("");
      } catch (error) {
        console.error("Error setting max duration to null:", error);
      }
    }
  };

  const handlePredict = async () => {
    try {
      const response = await axios.post("http://62.72.58.117:3000/predict", {
        temp_start: latestData.temperature,
        humi_start: latestData.humidity,
        target_temp: targetTemperature,
      });
      const predictionInSeconds = response.data.prediction;
      const minutes = Math.floor(predictionInSeconds / 60);
      const seconds = Math.floor(predictionInSeconds % 60);
      setPrediction(`${minutes} min ${seconds} sec`);
    } catch (error) {
      console.error("Error predicting:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!device) {
    return <div>Device not found. {deviceId}</div>;
  }

  return (
    <div className="container mx-auto">
      <LogoutButton />
      <h1 className="text-2xl font-bold mb-4">Device: {deviceId}</h1>
      <div className="mb-4">
        <div>Temperature: {latestData.temperature}°C</div>
        <div>Humidity: {latestData.humidity}%</div>
      </div>
      <div className="mb-4">
        <label htmlFor="targetTemperature" className="block mb-2">
          Target Temperature:
        </label>
        <input
          type="number"
          id="targetTemperature"
          value={targetTemperature}
          onChange={(e) => setTargetTemperature(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={handleUpdateTargetTemperature}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Update
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="maxDuration" className="block mb-2">
          Max Duration:
        </label>
        <input
          type="number"
          id="maxDuration"
          value={maxDuration}
          onChange={(e) => setMaxDuration(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={handleUpdateMaxDuration}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Update
        </button>
        <button
          onClick={handleSetMaxDurationToNull}
          className="bg-red-500 text-white px-4 py-2 rounded ml-2"
        >
          Set to Null
        </button>
      </div>
      <div className="mb-4">
        <button
          onClick={handlePredict}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Predict
        </button>
        {prediction && (
          <p>
            If you open the air conditioner now, {deviceId} will reach the
            target temperature in{" "}
            <span style={{ fontWeight: "bold", color: "gold" }}>
              {prediction}
            </span>
            .
          </p>
        )}
      </div>
      <button
        onClick={() => navigate("/dashboard")}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default DevicePage;
