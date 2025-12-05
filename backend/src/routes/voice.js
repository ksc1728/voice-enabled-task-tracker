const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { transcribeFileWithDeepgram, extractTaskFromTranscript } = require('../services/deepgram');
const { parseTranscript } = require('../services/parser');

const router = express.Router();


const TMP_DIR = path.join(__dirname, '../../tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const upload = multer({ dest: TMP_DIR });

router.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file required' });

    const filePath = req.file.path;
    let transcript = '';

    
    try {
      transcript = await transcribeFileWithDeepgram(filePath);
      console.log('✓ Transcription:', transcript);
    } catch (err) {
      console.error('Transcription error:', err.message || err);
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(502).json({ error: 'Transcription service failed', details: err.message });
    }

    
    let parsed;
    try {
      parsed = await extractTaskFromTranscript(transcript);
      console.log('Parsed task:', parsed);
    } catch (err) {
      console.error('AI parsing error, falling back to basic parser:', err.message);
      
      try {
        parsed = await parseTranscript(transcript);
      } catch (fallbackErr) {
        console.error('Fallback parser also failed:', fallbackErr.message);
        parsed = { 
          title: transcript, 
          description: transcript, 
          priority: 'MEDIUM', 
          status: 'TODO', 
          dueDate: null 
        };
      }
    }

    
    try { fs.unlinkSync(filePath); } catch (e) {}

    
    res.json({ 
      transcript, 
      parsed 
    });

  } catch (err) {
    console.error('Voice processing error:', err);
    res.status(500).json({ error: 'Voice processing failed', details: err.message });
  }
});

/**
 * POST /api/voice/parse
 * Parse text transcript -> task extraction (for Web Speech API)
 */
router.post('/parse', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript required' });
    
    console.log('Parsing transcript:', transcript);
    
    // Try AI extraction first
    let parsed;
    try {
      parsed = await extractTaskFromTranscript(transcript);
      console.log('✓ AI parsed:', parsed);
    } catch (err) {
      console.error('AI parsing failed, using fallback parser:', err.message);
      // Fallback to chrono-based parser
      parsed = await parseTranscript(transcript);
      console.log('✓ Fallback parsed:', parsed);
    }
    
    res.json({ transcript, parsed });
  } catch (err) {
    console.error('Parse endpoint error:', err);
    res.status(500).json({ error: 'Parsing failed', details: err.message });
  }
});

module.exports = router;