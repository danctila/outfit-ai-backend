require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3000;

app.post('/generate-outfit', async (req, res) => {
  const { weatherData, preferences, genderPreference } = req.body;

  if (!preferences || typeof preferences.warmthPreference === 'undefined' || typeof preferences.stylePreference === 'undefined') {
    console.error("Invalid preferences structure:", preferences);
    return res.status(400).json({ error: "Invalid preferences structure" });
  }

  console.log("Received weatherData:", weatherData);
  console.log("Received preferences:", preferences);
  console.log("Received genderPreference:", genderPreference);

  // Assume weatherData includes both current weather and future forecasts
  const forecastDescriptions = weatherData.forecast.map(forecast => {
    return `${forecast.time}: ${forecast.description}, ${forecast.temp}°C`;
  }).join('; ');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that suggests appropriate outfits based on weather and user preferences." },
        {
          role: "user",
          content: `
            Current Weather: ${weatherData.current.description}, Temperature: ${weatherData.current.temp}°C.
            Forecast: ${forecastDescriptions}.
            Preferences: Warmth: ${preferences.warmthPreference}, Style: ${preferences.stylePreference}, Footwear: ${preferences.footwearPreference}.
            Advanced: Rain: ${preferences.rainPreference}, Wind: ${preferences.windPreference}, Layers: ${preferences.layerPreference}.
            Gender: ${genderPreference}.
            Suggest an appropriate outfit considering the weather changes throughout the day.
          `,
        },
      ],
    });

    const generatedOutfit = completion.choices[0].message.content;
    res.json({ outfit: generatedOutfit });
  } catch (error) {
    console.error('Error generating outfit:', error.message);
    res.status(500).json({ error: 'Failed to generate outfit' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
