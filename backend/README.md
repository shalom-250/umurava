# UMURAVA SCREENING AI - Backend

An innovative AI-powered screening platform that automates candidate ranking and evaluation using Google Gemini.

## 🚀 Key Features
- **AI-Driven Ranking**: Automated candidate scoring and global ranking.
- **Transparent Reasoning**: Detailed strengths, gaps, and AI logic for every candidate.
- **Multi-Format Ingestion**: Supports Umurava talent profiles (JSON), PDF Resumes, and CSV files.
- **Batch Processing**: Scans through hundreds of candidates efficiently without loss of accuracy.
- **Interactive Documentation**: Full API docs at `/doc`.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas)
- Google Gemini API Key

### Installation
1.  **Clone the repo**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment**:
    Create a `.env` file:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/hackaton_db
    GEMINI_API_KEY=your_key_here
    JWT_SECRET=your_secret_here
    NODE_ENV=development
    ```
4.  **Run the application**:
    ```bash
    npm run dev
    ```

## 📖 Documentation
- [Architecture & Flow](docs/ARCHITECTURE.md)
- [AI Decision Flow & Assumptions](docs/AI_DECISION_FLOW.md)
- [Database Schema](docs/DATABASE.md)
- [Prompt Engineering Strategy](../src/services/prompt.docs.ts)

## ⚖️ Assumptions & Limitations
- Resumes should be text-searchable (not scanned images).
- Maximum resume text length processed is 5,000 characters per candidate.
- Batch size is limited to 5 candidates per AI request to maintain evaluation depth.

## 👥 Team: THE QA (Quality allocator)
- Backend: Node.js, MongoDB, Gemini API orchestration.
