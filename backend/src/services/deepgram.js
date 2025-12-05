const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const DG_API_KEY = process.env.DEEPGRAM_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DG_API_KEY) console.warn('DEEPGRAM_API_KEY not set; transcription will not work.');
if (!OPENAI_API_KEY) console.warn('OPENAI_API_KEY not set; task extraction AI will not work.');



async function transcribeFileWithDeepgram(filePath) {
  if (!DG_API_KEY) throw new Error('DEEPGRAM_API_KEY not configured');

  const audioBuffer = fs.readFileSync(filePath);

  const resp = await axios.post(
    'https://api.deepgram.com/v1/listen',
    audioBuffer,
    {
      headers: {
        'Content-Type': 'audio/wav',  
        'Authorization': `Token ${DG_API_KEY}`
      },
      params: {
        model: 'nova-2',   
        smart_format: true
      }
    }
  );

  const transcript =
    resp.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

  return transcript;
}



async function extractTaskFromTranscript(transcript) {

  
  if (!OPENAI_API_KEY) {
    return {
      title: transcript,
      description: transcript,
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: null
    };
  }

  // Date context for the AI
  const now = new Date();
  const dateInfo = {
    current_datetime: now.toISOString(),
    current_date: now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    current_time: now.toLocaleTimeString('en-US'),
    day_of_week: now.toLocaleDateString('en-US', { weekday: 'long' })
  };

  const system = `
You are a JSON extractor for task management. Today's date and time: ${dateInfo.current_date} at ${dateInfo.current_time} (${dateInfo.current_datetime}).

Extract fields:
- title
- description
- priority (LOW/MEDIUM/HIGH/CRITICAL)
- status (TODO/IN_PROGRESS/DONE)
- due_date (ISO timestamp or null)

Date rules:
- "today" = ${dateInfo.current_date}
- "tomorrow" = +1 day
- Days (Monday etc.) = next occurrence
- "evening"=6pm, "night"=8pm, "morning"=9am, "afternoon"=2pm

Return a single JSON object only.
`;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `Transcript: """${transcript}"""` }
    ],
    temperature: 0
  };

  const resp = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    body,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  let jsonText = resp.data?.choices?.[0]?.message?.content || '';
  jsonText = jsonText.trim().replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(jsonText);

    return {
      title: parsed.title || transcript,
      description: parsed.description || transcript,
      priority: (parsed.priority || 'MEDIUM').toUpperCase(),
      status: (parsed.status || 'TODO').toUpperCase(),
      dueDate: parsed.due_date || null
    };
  } catch (err) {
    console.warn('JSON parse failed → fallback', err.message);
    return {
      title: transcript,
      description: transcript,
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: null
    };
  }
}



module.exports = {
  transcribeFileWithDeepgram,
  extractTaskFromTranscript
};
