# Recruiter Dashboard Features

This document describes the enhancements made to the recruiter dashboard for better candidate tracking.

## 📄 Document Completion Status
Recruiters can now see at a glance whether a candidate has submitted all required documentation.

### 1. Shortlist Table Summary
The candidate list now includes a **Docs** column:
- **All Documents**: Candidate has submitted all required files.
- **X Missing**: Highlights the number of missing documents required for the position.

### 2. Detailed Checklist
Within the candidate reasoning drawer (accessible by clicking a candidate), a **Document Checklist** has been added:
- Lists all required items (e.g., Resume, Identity Document, Degree Certificate).
- Displays clear **COMPLETED** or **MISSING** status for each.
- Visual icons help identify gaps quickly.

## 🧩 Technical Implementation
- **Mock Data**: Interfaces in `src/lib/mockData.ts` were updated to support `requiredDocuments` in Jobs and `documentStatus` in ScreeningResults.
- **UI Components**: `ShortlistTable.tsx` and `CandidateReasoningDrawer.tsx` were modified to render these statuses.
