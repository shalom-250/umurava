# Architecture Overview - UMURAVA SCREENING AI

## System Architecture

```mermaid
graph TD
    A[Frontend: Next.js] -->|API Calls| B[Backend: Node.js + TS]
    B -->|Query/Save| C[Database: MongoDB]
    B -->|Orchestration| D[AI Layer: Gemini API]
    B -->|File Parsing| E[PDF/CSV Parser]
    D -->|Screening Results| B
    E -->|Extracted Text| B
```

## Layers
1.  **API Layer**: RESTful endpoints protected by JWT and documented with Swagger.
2.  **Processing Layer**: Logic for batching candidates and extracting text from multi-format files.
3.  **AI Orchestration**: Integration with Google Gemini for entity extraction and candidate ranking.
4.  **Database Layer**: Persistent storage for multi-dimensional screening data.
