const chrono = require('chrono-node');

const PRIORITY_MAP = {
  high: 'HIGH',
  urgent: 'HIGH',
  critical: 'CRITICAL',
  asap: 'HIGH',
  low: 'LOW',
  medium: 'MEDIUM',
  normal: 'MEDIUM'
};

function detectPriority(text) {
  const t = text.toLowerCase();
  for (const k of Object.keys(PRIORITY_MAP)) {
    if (t.includes(k)) return PRIORITY_MAP[k];
  }
  return null;
}

function detectStatus(text) {
  const t = text.toLowerCase();
  if (t.includes('done') || t.includes('completed') || t.includes('finish')) return 'DONE';
  if (t.includes('in progress') || t.includes('started') || t.includes('working on')) return 'IN_PROGRESS';
  return null;
}

function extractTitle(text, dateRanges = []) {
  let cleaned = text;

  // Remove detected date strings
  dateRanges.reverse().forEach(range => {
    const idx = range.index;
    const len = range.text.length;
    cleaned = cleaned.slice(0, idx) + cleaned.slice(idx + len);
  });

  // Remove priority words
  cleaned = cleaned.replace(/\b(high priority|high|urgent|critical|asap|low priority|low|medium priority|medium|normal)\b/ig, '');

  // Remove common task prefixes
  cleaned = cleaned.replace(/\b(remind me to|remind me|please|can you|create a|create an|create|add a|add an|add)\b/ig, '');
  
  // Remove status words
  cleaned = cleaned.replace(/\b(done|completed|finish|in progress|started|working on)\b/ig, '');
  
  // Collapse spaces and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^[,.\-:;]+|[,.\-:;]+$/g, '').trim();
  
  if (!cleaned) return null;
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function setDefaultTime(date, timeOfDay = 'morning') {
  // If the parsed date doesn't have a specific time, set defaults
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  
  if (!hasTime) {
    switch (timeOfDay) {
      case 'morning':
        date.setHours(9, 0, 0, 0);
        break;
      case 'afternoon':
        date.setHours(14, 0, 0, 0);
        break;
      case 'evening':
      case 'tonight':
        date.setHours(18, 0, 0, 0);
        break;
      case 'night':
        date.setHours(20, 0, 0, 0);
        break;
      default:
        date.setHours(9, 0, 0, 0); // Default to 9 AM
    }
  }
  
  return date;
}

function detectTimeOfDay(text) {
  const t = text.toLowerCase();
  if (t.includes('morning')) return 'morning';
  if (t.includes('afternoon')) return 'afternoon';
  if (t.includes('evening')) return 'evening';
  if (t.includes('tonight')) return 'tonight';
  if (t.includes('night')) return 'night';
  return 'morning'; 
}

async function parseTranscript(transcript) {
  const text = transcript.trim();
  
  
  const customChrono = chrono.casual.clone();
  
  
  const referenceDate = new Date();
  const results = customChrono.parse(text, referenceDate, { forwardDate: true });
  
  let dueDate = null;
  let dateRanges = [];
  
  if (results && results.length > 0) {
    
    const r = results[0];
    dateRanges = results.map(res => ({ index: res.index, text: res.text }));
    
    try {
      let dt = r.start.date();
      
      const timeOfDay = detectTimeOfDay(text);
      
      
      dt = setDefaultTime(dt, timeOfDay);
      
      dueDate = dt;
    } catch (e) {
      console.warn('Date parsing error:', e);
      dueDate = null;
    }
  }

  const priority = detectPriority(text) || 'MEDIUM';
  const status = detectStatus(text) || 'TODO';
  const title = extractTitle(text, dateRanges) || text;

  return {
    title,
    description: '',
    priority,
    status,
    dueDate: dueDate ? dueDate.toISOString() : null
  };
}

module.exports = { parseTranscript };