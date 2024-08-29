require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); 

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/generate-outfit', async (req, res) => {
  const { weatherData, preferences, generatorSettings } = req.body;

  try {
    let prompt = `Given the weather conditions: ${weatherData.description} with a temperature of ${weatherData.temp}°C, `;

    // Handle gender or custom preferences from the Preferences page
    if (preferences.genderPreference === 'choose my own clothing') {
      prompt += `and custom preferences: tops - ${preferences.customPreferences.tops.join(', ')}, bottoms - ${preferences.customPreferences.bottoms.join(', ')}, footwear - ${preferences.customPreferences.footwear.join(', ')}, accessories - ${preferences.customPreferences.accessories.join(', ')}, `;
    } else {
      prompt += `and gender preference: ${preferences.genderPreference}, `;
    }

    // Handle generator settings from the Generator page
    prompt += `with warmth preference - ${generatorSettings.warmthPreference}, style preference - ${generatorSettings.stylePreference}, footwear preference - ${generatorSettings.footwearPreference}, `;
    
    if (generatorSettings.showAdvancedOptions) {
      prompt += `rain preference - ${generatorSettings.rainPreference}, wind preference - ${generatorSettings.windPreference}, layer preference - ${generatorSettings.layerPreference}, `;
    }

    prompt += 'suggest an outfit.';

    console.log("Sending prompt to Hugging Face:", prompt);

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt2',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
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
