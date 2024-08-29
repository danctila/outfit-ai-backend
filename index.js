require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/generate-outfit', async (req, res) => {
  const { weatherData, preferences } = req.body;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        inputs: `Given the weather conditions: ${weatherData.description} with a temperature of ${weatherData.temp}°C, and preferences: warmth - ${preferences.warmthPreference}, style - ${preferences.stylePreference}, suggest an outfit.`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        }
      }
    );

    const generatedOutfit = response.data[0].generated_text;
    res.json({ outfit: generatedOutfit });
  } catch (error) {
    console.error('Error generating outfit:', error);
    res.status(500).json({ error: 'Failed to generate outfit' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
