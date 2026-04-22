# Umurava AI Platform - Technical Overview & Architecture

This document provides a comprehensive overview of the technologies, tools, and architecture used to build the Umurava AI Recruitment Platform. It explains the purpose of each technology, why we use it, and how they work together to create a seamless, scalable system.

## 🏗️ High-Level Architecture
The platform is built on a modern **MERN-stack** (MongoDB, Express, React, Node.js) but utilizes **Next.js** on the frontend for server-side rendering, routing, and optimized performance. The architecture is decoupled:
- **Frontend (Client)**: A Next.js application that handles the UI/UX for both Recruiters and Applicants.
- **Backend (API)**: A Node.js/Express server that acts as the central hub for business logic, database operations, and third-party AI integrations.
- **Database**: MongoDB (hosted on Atlas) as the primary data store.
- **AI Engine**: Google's Gemini API for intelligent text extraction and candidate ranking.

---

## 🎨 Frontend Stack

### 1. Next.js 15
- **What it is**: A React framework for building fast, SEO-friendly web applications.
- **Why we use it**: It provides App Router (`src/app`) for organized routing, server components for better load times, and API route capabilities. 
- **System Benefit**: Ensures the dashboard loads instantly for recruiters and the applicant portal feels snappy.

### 2. React 19
- **What it is**: The core JavaScript library for building user interfaces.
- **Why we use it**: Component-based architecture allows us to build reusable elements like `ShortlistTable`, `CreateJobModal`, and `SkillMatchChart`.

### 3. Tailwind CSS & Tailwind Typography
- **What it is**: A utility-first CSS framework.
- **Why we use it**: Allows for rapid UI development without writing custom CSS files. We use it to ensure the dashboard looks professional and consistent (e.g., using `bg-primary-700` or `text-muted-foreground`).

### 4. Redux Toolkit
- **What it is**: A predictable state container for JavaScript apps.
- **Why we use it**: Manages global application state, such as the currently logged-in user, authentication tokens, and shared data across different dashboard tabs.

### 5. Recharts
- **What it is**: A composable charting library.
- **Why we use it**: Used specifically to render the `SkillMatchChart` (Radar chart), giving recruiters a visual breakdown of candidate skills vs requirement expectations.

### 6. React Hook Form & Zod
- **What it is**: Form validation libraries.
- **Why we use it**: Used in modals like `CreateJobModal` to ensure recruiters fill out all required fields correctly before submitting data to the server.

### 7. Lucide React
- **What it is**: A beautiful icon library.
- **Why we use it**: Provides a clean, modern aesthetic for the dashboard navigation, buttons, and status indicators.

---

## ⚙️ Backend Stack

### 1. Node.js & Express
- **What it is**: A JavaScript runtime and a minimal web framework.
- **Why we use it**: Serves as the core API server that manages routes (`/api/jobs`, `/api/candidates`, `/api/screening`). Express handles HTTP requests from the Next.js frontend and communicates with the database and AI services.

### 2. MongoDB & Mongoose
- **What it is**: A NoSQL document database and an Object Data Modeling (ODM) library.
- **Why we use it**: Ideal for handling unstructured or semi-structured data like candidate resumes and dynamic job requirements. Mongoose helps enforce schemas.

### 3. @google/generative-ai (Gemini AI)
- **What it is**: Google's official SDK for interacting with the Gemini Large Language Models.
- **Why we use it**: The brain of the platform. It powers:
  - **Candidate Screening**: Ranking candidates against job requirements.
  - **Job Extraction**: Parsing uploaded PDF/DOCX job descriptions to auto-fill creation forms.
  - **Resume Parsing**: Extracting structured JSON data from unstructured CVs.

### 4. Multer
- **What it is**: A middleware for handling `multipart/form-data`.
- **Why we use it**: Securely manages file uploads. Used when recruiters upload CSVs of candidates or PDF/Word documents for AI Job Extraction.

### 5. PDF-Parse & Mammoth
- **What it is**: Libraries to extract raw text from PDF and DOCX files.
- **Why we use it**: Acts as a fallback parser. If the AI struggles to read the binary file directly, these tools extract the raw text, which is then fed to the AI for analysis.

### 6. JWT (JSON Web Tokens) & Bcrypt
- **What it is**: Authentication and encryption libraries.
- **Why we use it**: Secures the platform. Bcrypt hashes passwords so they are never stored in plain text. JWT ensures that only authorized recruiters can access the API endpoints via Bearer tokens.

## 🌍 Platform Capabilities Driven by this Tech Stack:
- **Intelligent Sorting**: Gemini AI + Node.js allows reading thousands of resume lines to output standardized skill arrays.
- **Reactive Interfaces**: Next.js + Tailwind + React means when an AI screening updates a status, the UI reflects this change seamlessly for the recruiter.
- **Centralized Verification**: MongoDB ensures that when an applicant sees "Screened", the Recruiter sees the exact same data point simultaneously.
