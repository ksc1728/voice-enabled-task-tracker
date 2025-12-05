// import React, { useState, useRef } from 'react';
// import { uploadAudio, parseTranscript } from '../api';

// export default function Recorder({ onParsed }) {
//   const [recording, setRecording] = useState(false);
//   const [status, setStatus] = useState('');
//   const mediaRef = useRef(null);
//   const chunksRef = useRef([]);

//   async function startRecord() {
//   setStatus('requesting');
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const mr = new MediaRecorder(stream);
//     mediaRef.current = mr;
//     chunksRef.current = [];

//     mr.ondataavailable = e => {
//       if (e.data.size > 0) chunksRef.current.push(e.data);
//     };

//     let alreadyStopped = false;

//     mr.onstop = async () => {
//       if (alreadyStopped) return;  // 🚀 prevents double upload
//       alreadyStopped = true;

//       setStatus('processing');
//       const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

//       const fd = new FormData();
//       fd.append('file', blob, 'recording.webm');

//       try {
//         const res = await uploadAudio(fd);
//         onParsed(res);
//       } catch (err) {
//         console.error(err);
//         setStatus('Transcription failed on server.');
//       }

//       setRecording(false);
//       setStatus('');
//     };

//     mr.start();
//     setRecording(true);
//     setStatus('recording');

//   } catch (e) {
//     console.error(e);
//     setStatus('microphone access denied');
//   }
// }


//   function stopRecord() {
//   if (mediaRef.current && mediaRef.current.state !== 'inactive') {
//     mediaRef.current.stop();  // ONLY stop the recorder
//   }
// }


  
//   async function transcribeClientSide() {
//     if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
//       alert('Browser does not support Web Speech API. Use a supported browser or configure server STT.');
//       return;
//     }
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recog = new SpeechRecognition();
//     recog.lang = 'en-US';
//     recog.interimResults = false;
//     recog.maxAlternatives = 1;
//     recog.onresult = async (ev) => {
//       const txt = ev.results[0][0].transcript;
//       setStatus('parsing...');
//       try {
//         const res = await parseTranscript(txt);
//         onParsed(res);
//       } catch (err) {
//         setStatus('Parsing failed');
//         console.error(err);
//       } finally {
//         setStatus('');
//       }
//     };
//     recog.onerror = (e) => {
//       console.error(e);
//       setStatus('Speech recognition error');
//     };
//     recog.start();
//     setStatus('listening locally...');
//   }

//   return (
//     <div style={{ marginBottom: 12 }}>
//       <button onClick={() => (recording ? stopRecord() : startRecord())}>
//         {recording ? 'Stop Recording' : 'Start Recording'}
//       </button>
//       <button style={{ marginLeft: 8 }} onClick={transcribeClientSide}>
//         Transcribe locally (Web Speech)
//       </button>
//       <div style={{ marginTop: 8 }}>{status}</div>
//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import { uploadAudio, parseTranscript } from '../api';

export default function Recorder({ onParsed }) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecord() {
    setStatus('Requesting microphone access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      let alreadyStopped = false;

      mr.onstop = async () => {
        if (alreadyStopped) return; // Prevent double upload
        alreadyStopped = true;

        setStatus('Processing audio...');
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        const fd = new FormData();
        fd.append('file', blob, 'recording.webm');

        try {
          const res = await uploadAudio(fd);
          
          // Response format: { transcript, parsed }
          console.log('Transcription result:', res);
          
          if (res.transcript) {
            setStatus(`Transcribed: "${res.transcript}"`);
          }
          
          // onParsed(res);
          onParsed({
            transcript: res.transcript,
            parsed: res.parsed
          });

          setStatus('');
        } catch (err) {
          console.error('Transcription error:', err);
          setStatus(`Error: ${err.message}`);
          
          // Clear error after 5 seconds
          setTimeout(() => setStatus(''), 5000);
        }

        setRecording(false);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mr.start();
      setRecording(true);
      setStatus('🎤 Recording... Click "Stop" when done');

    } catch (e) {
      console.error('Microphone error:', e);
      setStatus('❌ Microphone access denied');
      setTimeout(() => setStatus(''), 3000);
    }
  }

  function stopRecord() {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
  }

  async function transcribeClientSide() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Browser does not support Web Speech API. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    
    recog.onstart = () => {
      setStatus('🎤 Listening... Speak now');
    };
    
    recog.onresult = async (ev) => {
      const txt = ev.results[0][0].transcript;
      console.log('Web Speech result:', txt);
      setStatus(`Heard: "${txt}" - Parsing...`);
      
      try {
        const res = await parseTranscript(txt);
        
        // Response format: { transcript, parsed }
        console.log('Parse result:', res);
        onParsed(res);
        setStatus('');
      } catch (err) {
        console.error('Parsing error:', err);
        setStatus(`Error: ${err.message}`);
        setTimeout(() => setStatus(''), 5000);
      }
    };
    
    recog.onerror = (e) => {
      console.error('Speech recognition error:', e);
      
      let errorMsg = 'Speech recognition error';
      if (e.error === 'no-speech') {
        errorMsg = 'No speech detected. Please try again.';
      } else if (e.error === 'network') {
        errorMsg = 'Network error. Check your connection.';
      } else if (e.error === 'not-allowed') {
        errorMsg = 'Microphone access denied.';
      }
      
      setStatus(`❌ ${errorMsg}`);
      setTimeout(() => setStatus(''), 5000);
    };
    
    recog.onend = () => {
      if (status.includes('Listening')) {
        setStatus('');
      }
    };
    
    try {
      recog.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setStatus('Failed to start speech recognition');
      setTimeout(() => setStatus(''), 3000);
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <button 
        onClick={() => (recording ? stopRecord() : startRecord())}
        style={{
          backgroundColor: recording ? '#dc3545' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {recording ? '⏹ Stop Recording' : '🎤 Start Recording'}
      </button>
      
      <button 
        onClick={transcribeClientSide}
        style={{ 
          marginLeft: 8,
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🗣 Transcribe locally (Web Speech)
      </button>
      
      {status && (
        <div style={{ 
          marginTop: 8, 
          padding: '8px 12px',
          backgroundColor: status.includes('Error') || status.includes('❌') ? '#f8d7da' : '#d1ecf1',
          color: status.includes('Error') || status.includes('❌') ? '#721c24' : '#0c5460',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}