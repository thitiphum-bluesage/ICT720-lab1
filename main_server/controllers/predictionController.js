const axios = require("axios");

exports.predict = async (req, res) => {
  try {
    const { temp_start, humi_start, target_temp } = req.body;

    const response = await axios.post("http://localhost:4000/predict/", {
      temp_start,
      humi_start,
      target_temp,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error predicting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
