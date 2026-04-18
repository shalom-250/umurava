# AI Decision Flow Diagram

This diagram illustrates the logical flow of the Umurava AI Screening engine.

```mermaid
graph TD
    A[Job Created/Requirements Defined] --> Trigger{Recruiter Triggers AI}
    
    B1[Formal Job Applicants] --> Pool[Unified Candidate Pool]
    B2[Raw CSV Imports] --> Pool
    B3[Unstructured Resumes / Uploads] --> Pool
    
    Pool --> Trigger
    
    Trigger --> F[Build Gemini Context Window]
    F --> G[Gemini 1.5 Flash Analysis]
    
    subgraph "Scoring Engine (P0)"
    G --> H[Skills Match - 50%]
    G --> I[Experience Match - 30%]
    G --> J[Education Match - 20%]
    end
    
    H & I & J --> K[Aggregate Score 0-100]
    K --> L[Generate Strengths & Gaps]
    L --> M[Assign Recommendation Tier]
    M --> N[JSON Output to Dashboard]
    
    N --> O[Recruiter Review]
```

## Flow Description
1.  **Context Injection**: The system injects the full job description and a batch of candidate profiles into the LLM context.
2.  **Weighted Dimension Analysis**: The AI evaluates three distinct dimensions with predefined weights.
3.  **Qualitative Synthesis**: Beyond numbers, the AI synthesizes "Strengths" and "Gaps" to provide actionable explainability.
4.  **Tier Assignment**:
    *   **Shortlist**: Strong alignment (>80%).
    *   **Waitlist**: Potential match with gaps (60-80%).
    *   **Reject**: Significant mismatches (<60%).
