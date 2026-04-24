# Umurava Recruitment System Update Documentation

This document outlines the major functionality enhancements, cloud migrations, and interface upgrades applied to the UmuravaAI recruitment ecosystem. It provides both the technical insight into the engineering involved and a clear guide on how these updates impact the end user's operational flow.

---

## 1. Cloudinary Persistent Document Storage
### Technical Analysis
Previously, the backend was mapped to an ephemeral filesystem cache, meaning server reboots destroyed uploaded CVs. We integrated the `cloudinary` Node API to permanently persist files off-site.
*   **Job Processing**: Incoming candidate applications dynamically upload PDFs into localized, job-specific folders (e.g. `umurava_jobs/Project-Manager/Candidate_CV.pdf`).
*   **Talent Pool Pipeline**: Bulk uploads via the `/candidates/parse` endpoints extract AI data and instantly push the PDF to a secure permanent bucket (`umurava_resumes`), binding the active `secure_url` direct-download payload to the candidate schema.

### End User Flow
As a recruiter, you never need to worry about losing access to a candidate's file again. 
*   **Local Jobs**: When applicants apply, or when you click **"Upload CVs"**, the files are saved permanently to the cloud. 
*   **Global Additions**: Navigating to the *Shared Talent Pool* and dragging 100 PDFs into **"Add New Talent"** uploads those documents securely to the exact same cloud drive, tying a permanent downloading icon to each newly parsed profile flawlessly.

---

## 2. Dynamic Shortlist Action Interactions
### Technical Analysis
The candidate table component (`ShortlistTable.tsx`) was heavily upgraded to receive live `applications` state payloads. We wrote conditional rendering loops using highly descriptive Lucide vector icons (`Calendar`, `CheckCircle`, `XCircle`) to ensure that buttons dynamically dissolve if opposing decisions are triggered.
 
### End User Flow
As you evaluate AI-ranked profiles, the decision tools are actively color-coded and highly intuitive:
*   📅 **Calendar Button**: Click to safely move the candidate to the "Interview" stage. (This button vanishes once clicked, preventing duplicate interview requests).
*   ✅ **Check Mark Button**: Move the candidate exclusively to "Hired".
*   ✖️ **X Mark Button**: Move the candidate exclusively to "Rejected".
If a candidate becomes Hired or Rejected, the entire row's action panel is completely cleared dynamically, simplifying your cognitive load while scrolling long lists.

---

## 3. Intelligent "Stored CVs" File Display
### Technical Analysis
The `StoredFilesModal` query engine was completely rebuilt. Instead of just grabbing anonymous storage URLs, the `getJobFiles` backend controller executes `.populate()` commands into MongoDB, attaching the candidate's real `Candidate Name`. We cross-referenced the `Screening` collection within the same request so the front end receives an attached `aiScore` cleanly integrated inside the exact same API response.

### End User Flow
Opening the **"Stored CVs"** modal on a job is radically more readable! Instead of seeing a wall of ugly `John_resume_v1_001.pdf` strings:
*   Every CV states clearly: **Candidate Name - File Title** 
*   If our Gemini AI has previously scored the candidate, a bright green **AI Match Score: 85%** inline badge appears permanently stamped adjacent to the PDF details so you can sort the actual document's quality instantly out of a massive pile!

---

## 4. Seamless Data Exporting (Excel & PDFs)
### Technical Analysis
Removed background filtering constraints embedded within `handleExportPdf` and `handleExportExcel`. We swapped the legacy `jspdf-autotable` implementation into modern explicit imports to completely remove frontend execution crashes. Downloads now directly map the `filteredResults` dataset exclusively based on what the UI filter is currently yielding.

### End User Flow
A flawless Export engine! Click either the **Export PDF** or **Export Excel** button directly above your candidates and whatever candidate rankings you actually see on screen will be identically captured into a high-quality spreadsheet or a beautifully stylized boardroom-ready PDF presentation.

---

## 5. Hydrating Secure Identities
### Technical Analysis
The Recruiter Dashboard's primary `Sidebar.tsx` was plagued by an initial load sequence prioritizing a hardcoded string ("Aline Uwimana"). We injected a secure React `useEffect` hydration barrier (`mounted`), guaranteeing the component securely waits for the `/api/user` query to unpack the validated user object securely from internal storage.

### End User Flow
No more ghostly placeholders! The instant you securely log into your recruiter or applicant profile, your real name, identity, and access-specific role appear prominently across the entire sidebar navigation precisely mapping to your true identity seamlessly.
