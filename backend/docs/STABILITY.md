# App Stability & Performance

This document outlines measures taken to ensure the UmuravaAI application remains stable and performant.

## 💧 Next.js Hydration Fixes

### The Issue
Components using non-deterministic data (like `Date.now()` or `new Date()`) during the initial render caused mismatches between the server-generated HTML and the client-side React tree. This resulted in hydration errors and flickering UI.

### The Solution
We implemented **Deterministic Rendering** in several key components:
1.  **RecruiterDashboardClient**: Moved the "Last Screened" timestamp calculation into a `useEffect` hook.
2.  **KpiCards**: Moved the "Days to Deadline" countdown into a `useEffect` hook.

By using a `mounted` state or calculating these values only after the component has hydrated on the client, we ensure the initial HTML is identical on both sides.

### 3. Hydration Suppression
Browser extensions (like password managers or translators) often inject attributes (e.g., `fdprocessedid`) into the DOM before React hydrates. This causes mismatches on interactive elements.
- **Fix**: Applied `suppressHydrationWarning` to all buttons, inputs, and filter containers in the Recruiter Dashboard to ignore these non-impactful attribute differences.

## 🛡️ Defensive Programming (Crash Prevention)

To handle real-world backend data which may occasionally be fragmented or missing fields:
- **Null Checks**: Added robust null/undefined checks in `KpiCards.tsx` and `RecruiterDashboardClient.tsx` for all data-driven fields (counts, scores, dates).
- **Search Robustness**: The job search filter now uses optional chaining and null checks to ensure that missing `department` or `location` fields in a job object do not crash the search functionality.
- **Fallback Data**: Implemented a graceful fallback to mock data if the backend API is unreachable or returns an empty set, ensuring a functional UI at all times.
