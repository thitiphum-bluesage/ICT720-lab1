import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(
        "http://62.72.58.117:3000/users/verify-token",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
      fetchDevices(response.data.userId);
    } catch (error) {
      console.error("Error verifying token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchDevices = async (userId) => {
    try {
      const response = await axios.get(
        `http://62.72.58.117:3000/devices/user/${userId}`
      );
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleAddDevice = async () => {
    try {
      const deviceId = prompt("Enter the device ID:");
      if (deviceId) {
        await axios.post("http://62.72.58.117:3000/devices/register", {
          device_id: deviceId,
          description: "",
          target_temperature: 0,
          user_id: user.userId,
        });
        fetchDevices(user.userId);
      }
    } catch (error) {
      console.error("Error adding device:", error);
    }
  };

  const handleDeviceClick = (deviceId) => {
    navigate(`/device/${deviceId}`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <LogoutButton />
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={handleAddDevice}
      >
        Add Device
      </button>
      <ul className="space-y-4">
        {devices.map((device) => (
          <li
            key={device.device_id}
            className="bg-white p-4 rounded shadow cursor-pointer"
            onClick={() => handleDeviceClick(device.device_id)}
          >
            <h2 className="text-xl font-bold">{device.device_id}</h2>
            <p>{device.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
