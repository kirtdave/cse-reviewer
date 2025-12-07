// check_models.js
require('dotenv').config();
const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env file");
    return;
  }

  console.log("🔍 Querying Google AI for available models...");
  console.log(`🔑 Using Key: ${apiKey.substring(0, 5)}...`);

  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    const models = response.data.models;
    
    // Filter only models that can generate text (content)
    const generateModels = models.filter(m => 
      m.supportedGenerationMethods.includes("generateContent")
    );

    console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
    console.log("====================================");
    generateModels.forEach(model => {
      console.log(`👉 NAME: ${model.name}`);
      console.log(`   Display: ${model.displayName}`);
      console.log(`   Version: ${model.version}`);
      console.log("------------------------------------");
    });

  } catch (error) {
    console.error("\n❌ FAILED TO LIST MODELS:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
}

listModels();