require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import cors

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/generate-outfit', async (req, res) => {
  const { weatherData, preferences } = req.body;

  // Debugging: Log the incoming weatherData and preferences
  console.log("Received weatherData:", weatherData);
  console.log("Received preferences:", preferences);

  try {
    // Ensure weatherData and preferences contain the expected properties
    if (!weatherData || !weatherData.description || !weatherData.temp) {
      console.error('Invalid weatherData structure:', weatherData);
      return res.status(400).json({ error: 'Invalid weather data provided' });
    }

    if (!preferences || !preferences.warmthPreference || !preferences.stylePreference) {
      console.error('Invalid preferences structure:', preferences);
      return res.status(400).json({ error: 'Invalid preferences provided' });
    }

    const prompt = `Given the weather conditions: ${weatherData.description} with a temperature of ${weatherData.temp}°C, and preferences: warmth - ${preferences.warmthPreference}, style - ${preferences.stylePreference}, suggest an outfit.`;
    
    console.log("Sending prompt to Hugging Face:", prompt);

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        }
      }
    );

    console.log("Response from Hugging Face:", response.data);

    if (response.data && response.data[0] && response.data[0].generated_text) {
      const generatedOutfit = response.data[0].generated_text;
      res.json({ outfit: generatedOutfit });
    } else {
      console.error("Unexpected response format from Hugging Face:", response.data);
      res.status(500).json({ error: 'Unexpected response format from Hugging Face' });
    }

  } catch (error) {
    console.error('Error generating outfit:', error.message);
    res.status(500).json({ error: 'Failed to generate outfit' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
