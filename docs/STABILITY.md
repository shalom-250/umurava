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

## 🛠️ Performance Optimizations
- **Client-Side Calculation**: Offloaded complex date and statistic filtering for the dashboard to the client to keep the server response lightweight.
- **Lucide Icon Optimization**: Used individual icon imports to ensure minimal bundle sizes.
