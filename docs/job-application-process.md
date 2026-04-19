# Job Application Process & Candidate Eligibility

This document outlines the workflow candidates follow when applying for jobs on the Umurava platform, as well as the underlying logic of the **Smart Eligibility Engine**.

## 1. Browsing Jobs

Candidates browse available roles in the **Browse Jobs** tab. Every job listed provides:
- The role description and required specifications.
- Must-have skills, required experience levels (e.g., Junior, Senior), and educational requirements.
- Real-time matching indicators reflecting the candidate's qualification for the job.

## 2. Smart Eligibility Engine

Before clicking "Apply Now," each candidate undergoes a real-time smart eligibility check against the job's strict requirements.

The checking process verifies three main axes:
1. **Skill Match**: Compares the job's `requiredSkills` to the candidate's profile `skills`.
2. **Work Experience**: If a job specifies a `Senior` or `Lead` level, the candidate **must** have completed work experience entries in their profile.
3. **Education**: If a job description or requirements explicitly mention a degree (e.g., "bachelor", "master", "university degree"), the candidate **must** have filled out the "Education" section.

### Visual Feedback
Candidates are presented with a detailed **Eligibility Panel**:
- **Match Score Ring**: A visual indicator (0–100%) showing how close their profile is to the requirements.
- **Per-Skill Checkmarks**: Easily see exactly which required skills hit (🟢 ✓) and which are missing (🔴 ✗).
- **Requirements Checklist**: Quick checks confirming if Experience and Education rules are met.

## 3. Dealing with "Not Eligible" Status

If a candidate is missing essential qualifications needed for the job, the "Apply Now" button will be disabled, indicating a **"Not Eligible"** status. 

### Resolving Eligibility Issues
The platform clearly provides actionable steps when lacking requirements:
- A prominent panel lists: **"What you need to qualify"**.
- It shows the specific missing components (e.g., "Missing required skills: React, TypeScript" or "A university degree is required for this position").
- Candidates can click the suggested **"Update my profile to qualify"** link.

This redirects them to their **Profile Builder**, where they can fill in the missing information. Once the profile data is persisted in the database, they can return to the Browse Jobs section and the eligibility engine will dynamically re-assess them granting them application permission.

## 4. Submitting an Application

Once the Candidate is verified as completely eligible:
- The Apply button activates and is clearly labeled **"Apply Now"**.
- Clicking Apply securely contacts the Umurava backend (`POST /api/applications`).
- The backend matches the logged-in candidate session with the targeted Job and restricts duplicated submissions securely. 
- Success creates a permanent application record tracked in the database, and the UI verifies this with a reassuring **"Applied"** checkmark icon.

## 5. Next Steps
Once applied, the candidate will be further auto-screened by our Gemini AI, allowing Recruiters to see ranking score and analysis immediately. Applicants can monitor their exact statuses (e.g., Screened, Interview, Hired) via the **My Applications** tab.
