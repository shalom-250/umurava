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
The Recruiter Dashboard's primary `Sidebar.tsx` was plagued by an initial load sequence prioritizing a hardcoded string ("Aline Uwimana"). We injected a secure React `useEffect` hydration barrier (`mounted`), guaranteeing the component securely waits for the `/api/user` query to unpack the validated user object securely from internal storage. Furthermore, the `ApplicantPortalClient` and `RecruiterDashboardClient` now pull directly from the `api.getUser()` method to ensure session-based names (like "Olivier") are used as fallbacks for un-filled profiles.

### End User Flow
No more ghostly placeholders! The instant you securely log into your recruiter or applicant profile, your real name, identity, and access-specific role appear prominently across the entire sidebar navigation precisely mapping to your true identity seamlessly.

---

## 6. Full-Portal Responsive Overhaul
### Technical Analysis
We unified the mobile navigation experience across both Applicant and Recruiter dashboards. 
*   **Media Queries**: Swapped `md:flex` for `lg:flex` breakpoints in the global `Sidebar.tsx` to ensure all iPad/Tablet and Mobile views utilize the space-efficient hamburger menu.
*   **Contextual Drawer**: The mobile navigation drawer now includes a fixed **Identity Card** at the base (showing Name, Role, and a red Sign Out button) to accommodate touch-screen users who cannot use "hover" menus.
*   **Mobile Branding**: Injected "UmuravaAI" branding into the mobile-specific header to maintain institutional trust on small screens.

### End User Flow
The system is now 100% mobile-ready. Whether you are browsing jobs on your phone or screening candidates on an iPad, the interface "breathes" correctly. The main desktop sidebar hides away, and a simple tap of the menu icon gives you access to everything including your profile info and a clear logout button.

---

## 7. Cloud-Hosted Profile Avatars (Cloudinary)
### Technical Analysis
Following the CV cloud migration, we extended Cloudinary support to personal branding.
*   **Backend**: Added a `photoUrl` field to the `Candidate` schema and built a multipart `/me/photo` endpoint.
*   **Transformation**: The backend uses the Cloudinary SDK to apply a **500x500 center-crop** transformation automatically ensuring all avatars are perfectly square and high-resolution.
*   **Frontend**: Replaced the "Upload Photo" dummy button with a functional `api.postForm` trigger that provides live `toast.loading` feedback while the image is being optimized in the cloud.

### End User Flow
Your profile can now have a face! Click **"Upload Photo"** on your profile, and your selected image is instantly optimized and stored in the cloud. Your initials are replaced by your real photo across the entire portal immediately.

---

## 8. Competitive Shortlisted Leaderboard
### Technical Analysis
To improve transparency and user engagement, we built a secure candidate roster visibility layer within `MyApplicationsTab.tsx`.
*   **Gated Access**: The leaderboard is programmatically locked unless the applicant reaches a status of **Shortlisted** or **Hired**.
*   **Dynamic Highlighting**: The component fetches the job's candidate pool, sorts them by AI match score, and uses a `(You)` tag and primary-color highlight to clearly anchor the user's relative standing in the vetting process.

### End User Flow
Motivation through transparency! Once you are shortlisted for a job, you can expand your application to see the "Candidate Leaderboard". You’ll see exactly where you rank among your peers, helping you understand your competitive edge in the UmuravaAI ecosystem.

