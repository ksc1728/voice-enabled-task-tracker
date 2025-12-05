const express = require("express");
const multer = require("multer");

const { transcribeFileWithDeepgram,extractTaskFromTranscript } = require('../services/deepgram');

const { parseTranscript } = require("../services/parser");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const transcript = await transcribeFileWithDeepgram(filePath);
    const parsedTask = await extractTaskFromTranscript(transcript);

    res.json({
      transcript,
      task: parsedTask
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
