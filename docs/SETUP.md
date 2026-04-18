# Project Setup & Run Instructions

This guide provides the necessary steps to get the UmuravaAI project running locally.

## ⚙️ Environment Configuration

Before running the application, you must configure the following environment variables.

### 1. Backend Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hackaton_db
GEMINI_API_KEY=AIzaSyCDkyCH8HSVCatxkJnCA_C6ATq1qFk5rY4
JWT_SECRET=your_secure_random_string
NODE_ENV=development
```


## 🛠️ Installation

### 1. Root Directory (Frontend)
Ensure all dependencies are installed in the root directory:
```bash
npm install
```

### 2. Backend Directory
Navigate to the backend and install dependencies:
```bash
cd backend
npm install
```

## 🚀 Running the Project

You need to run both the frontend and backend concurrently.

### 1. Start the Backend
From the `backend` directory:
```bash
npm run dev
```
*Port: 5000*

### 2. Start the Frontend
From the root directory:
```bash
npm run dev
```
*Port: 4028*

## 💾 Database Seeding
To populate the database with initial users, jobs, and candidates:
```bash
cd backend
npm run seed
```
