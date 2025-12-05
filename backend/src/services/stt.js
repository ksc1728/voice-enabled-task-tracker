const fs = require('fs');
const axios = require('axios');

const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY;

async function transcribeWithDeepgram(filePath) {
  if (!DEEPGRAM_KEY) throw new Error("DEEPGRAM_API_KEY not set");

  const audioBuffer = fs.readFileSync(filePath);

  const response = await axios({
    method: "POST",
    url: "https://api.deepgram.com/v1/listen",
    headers: {
      "Authorization": `Token ${DEEPGRAM_KEY}`,
      "Content-Type": "audio/wav" 
    },
    data: audioBuffer
  });

  return response.data.results.channels[0].alternatives[0].transcript;
}

module.exports = { transcribeWithDeepgram };
