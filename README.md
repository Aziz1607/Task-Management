# Task Management App

A full-stack Task Management application built with **Angular (v19)**, **Express.js**, and **MongoDB**.

---

## 🚀 Tech Stack

- **Frontend**: Angular 19 (Standalone Components, Signals, Reactive Forms, HttpClient)
- **Backend**: Express.js (Node.js REST API, Mongoose ORM, Input Validation & Error Handling)
- **Database**: MongoDB (Supports local MongoDB, MongoDB Atlas, and zero-config in-memory dev database)
- **API**: RESTful JSON API with CORS enabled

---

## 📁 Project Structure

```text
├── frontend/
│   └── Angular/ (mapped to src/app/)
│       ├── components/
│       │   ├── navbar/
│       │   ├── task-filter/
│       │   ├── task-item/
│       │   ├── task-form/
│       │   └── toast/
│       ├── pages/
│       │   └── task-list-page/
│       ├── services/
│       │   ├── task.service.ts
│       │   └── notification.service.ts
│       └── models/
│           └── task.model.ts
│
└── backend/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── taskController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── validateTask.js
    ├── models/
    │   └── Task.js
    ├── routes/
    │   └── taskRoutes.js
    ├── .env
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## ✨ Features

### Angular Frontend
- **List tasks**: View all tasks with status badges, priority tags, and due dates.
- **Add a task**: Modal form with validation for title, description, status, priority, and due date.
- **Edit a task**: Modify title, description, status, priority, or due date.
- **Delete a task**: Delete task with inline confirmation.
- **Mark task as completed**: Quick checkbox toggle with visual completion styling.
- **Filter tasks by status**: Filter by **All**, **Pending**, **In Progress**, or **Completed** with live counter badges.
- **Search & Sort**: Search tasks by keyword and sort by date created, due date, priority, or title.
- **Toast Notifications**: Feedback notifications on create, update, delete, and toggle actions.

### Express.js REST API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks (supports `?status=...`, `?search=...`, `?sortBy=...`, `?sortOrder=...`) |
| `GET` | `/api/tasks/:id` | Get single task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update an existing task |
| `DELETE` | `/api/tasks/:id` | Delete a task by ID |

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- *(Optional)* **MongoDB** (If not running, the backend automatically uses an embedded in-memory MongoDB instance for development with seeded sample tasks).

### 2. Run Backend
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 3. Run Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm start
```
The Angular app will run on `http://localhost:4200`.

---

## ⚙️ Environment Variables (Backend)

In `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management_db
NODE_ENV=development
```
To connect to MongoDB Atlas, replace `MONGODB_URI` with your connection string.

