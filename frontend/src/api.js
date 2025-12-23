// import axios from 'axios';

// const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// // Task API
// export async function fetchTasks(params) {
//   return axios.get(`${BASE}/tasks`, { params }).then(r => r.data);
// }

// export async function createTask(payload) {
//   return axios.post(`${BASE}/tasks`, payload).then(r => r.data);
// }

// export async function updateTask(id, payload) {
//   return axios.put(`${BASE}/tasks/${id}`, payload).then(r => r.data);
// }

// export async function deleteTask(id) {
//   return axios.delete(`${BASE}/tasks/${id}`).then(r => r.data);
// }

// // Voice API
// export async function uploadAudio(formData) {
//   try {
//     const response = await axios.post(`${BASE}/voice/transcribe`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//       timeout: 30000 // 30 second timeout for audio processing
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Audio upload error:', error);
//     const message = error.response?.data?.error || error.message || 'Failed to transcribe audio';
//     throw new Error(message);
//   }
// }

// export async function parseTranscript(transcript) {
//   try {
//     const response = await axios.post(`${BASE}/voice/parse`, { transcript });
//     return response.data;
//   } catch (error) {
//     console.error('Transcript parse error:', error);
//     const message = error.response?.data?.error || error.message || 'Failed to parse transcript';
//     throw new Error(message);
//   }
// }

import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // stored after login

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
// Auth
export async function registerUser(payload) {
  return api.post('/auth/signup', payload).then(r => r.data);
}

export async function loginUser(payload) {
  return api.post('/auth/login', payload).then(r => r.data);
}
// Tasks
export async function fetchTasks(params) {
  return api.get('/tasks', { params }).then(r => r.data);
}

export async function createTask(payload) {
  return api.post('/tasks', payload).then(r => r.data);
}

export async function updateTask(id, payload) {
  return api.put(`/tasks/${id}`, payload).then(r => r.data);
}

export async function deleteTask(id) {
  return api.delete(`/tasks/${id}`).then(r => r.data);
}
export async function uploadAudio(formData) {
  try {
    const response = await api.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.message;
    throw new Error(message);
  }
}

export async function parseTranscript(transcript) {
  try {
    const response = await api.post('/voice/parse', { transcript });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.message;
    throw new Error(message);
  }
}
