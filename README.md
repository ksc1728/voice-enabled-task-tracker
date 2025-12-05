# Voice Enabled Task Tracker

A full-stack MERN application that converts **voice commands into structured tasks**, using **Deepgram AI**, and displays them in a **kanban-style drag-and-drop task board**.

Users can:

* Record audio -> AI transcribes -> AI extracts structured task details
* Add tasks manually
* Drag & drop tasks across columns (TODO -> IN PROGRESS -> DONE)
* Transcribe voice locally (browser Web Speech API)
* Upload audio to backend for Deepgram transcription

---

# Features

### **Voice Enabled Task Tracker**

* Record audio
* audio transcribes
* GPT extracts structured task fields:

  * Title
  * Description
  * Priority
  * Due date

### **Two voice transcription modes**

1. **Start Recording**
   Sends audio to backend -> Deepgram -> parsing -> Task created.

2. **Transcribe Locally**
    Uses browser Web Speech API
    Works offline (no backend).
    Still sent to Deepgram for task extraction.

### **Task Management**

* Create tasks manually
* Move tasks between columns (drag & drop)
* Edit/update tasks
* Delete tasks

### **Tech Stack**

**Frontend:** React, DnD-Kit, Axios
**Backend:** Node.js, Express, Multer, Deepgram API, Mongoose
**Database:** MongoDB Atlas
**AI:** AI task extraction

---

# Project Structure

```
project/
│
|- backend/
│   |- routes/
│   │   |- tasks.js          # CRUD routes for tasks
│   │   |- voice.js          # Deepgram API
│   │   |- sttRoutes.js      # Additional speech-to-text route
│   │
│   |- models/
│   │   |- Task.js           # Mongoose schema
│   │
│   |- services/
│   │   |- deepgram.js         # Task extraction using AI
│   │   |- parser.js         # Backup parser if AI fails
│   │   |- stt.js            # Alternative speech-to-text service
│   │
│   |- src/
│   │   |- app.js            # Express server entry + middleware
│   │
│   |- .env                  # Backend environment variables
│   |- package.json
│
|- frontend/
    |- src/
    │   |- api.js            # Axios API calls to backend
    │   |- App.js            # Main application logic
    │   |- components/
    │   │   |- Recorder.js      # Audio recording logic
    │   │   |- TaskBoard.js     # Kanban board
    │   │   |- TaskForm.js      # Manual task creation form
    │   │   |- TaskModal.js     # Voice task confirmation popup
    │   │   |- DroppableColumn.js
    │   |   |- SortableTask.js  # Drag-and-drop task card 
    │   |- index.js
    │
    |- .env                  # Frontend API base URL
    |- package.json
```

---

# Environment Variables

## Backend `.env`

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/aerchain
DEEPGRAM_API_KEY=your_deepgram_api_key
PORT=5000
```



## Frontend `.env`

```
REACT_APP_API_BASE_URL=http://localhost:5000
```

## END points

| Method   | Route               | Purpose                              |
| -------- | ------------------- | ------------------------------------ |
| `GET`    | `/tasks`            | Fetch all tasks                      |
| `POST`   | `/tasks`            | Create a task                        |
| `PUT`    | `/tasks/:id`        | Update a task                        |
| `DELETE` | `/tasks/:id`        | Delete a task                        |
| `POST`   | `/voice/transcribe` | Upload audio -> Deepgram -> parsing  |
| `POST`   | `/voice/parse`      | Parse plain text into task           |


# How the AI Voice Flow Works

### **1. User clicks "Start Recording"**

Recorder in `Recorder.js` captures audio using MediaRecorder API -> sends `.webm` file to backend.

### **2. Backend receives audio**

`voice.js` route:

* Saves file via multer
* Sends to Deepgram
* Receives transcript

### **3. AI extracts task data**

`extractTaskFromTranscript()` transforms raw voice text into:

```json
{
  "title": "Prepare project report",
  "description": "Include sales numbers and graphs",
  "priority": "HIGH",
  "dueDate": "2025-03-20",
  "status": "TODO"
}
```

### **4. Task is shown in popup (TaskModal.js)**

User clicks **OK** -> task is saved to MongoDB.


# How to Run the Project

## 1. Install backend dependencies

```
cd backend
npm install
```

## 2. Add `.env`

(as shown above)

## 3. Start backend

```
npm run dev
```

---

## 4. Install frontend dependencies

```
cd frontend
npm install
```

## 5. Add frontend `.env`

```
REACT_APP_API_BASE_URL=http://localhost:5000
```

## 6. Start frontend

```
npm start
```

---

# Future Improvements

* Add user authentication
* Add reminders/notifications
* Add project categories
* Support longer audio files

---

# Final Notes

This app demonstrates integration of:

* AI transcription
* AI task parsing
* MERN CRUD backend
* React drag-and-drop UI
* Full voice input pipeline
