# Application Status Lifecycle

This document outlines the various statuses an application can transition through in the Umurava AI platform and the triggers for each state change.

## Status Overview

| Status | Source Name (DB) | UI Label (Applicant) | Description |
| :--- | :--- | :--- | :--- |
| **Applied** | `Applied` | **Submitted** | The initial state when a candidate applies for a job. |
| **Under Review** | `Under Review` | **Under Review** | Set automatically when a recruiter triggers the "Run AI Screening" process. |
| **Screened** | `Screened` | **Screened** | Set automatically after the Gemini AI has successfully analyzed and ranked the candidate. |
| **Shortlisted** | `Shortlisted` | **Shortlisted** | Set manually by the recruiter for high-performing candidates or those they intend to move forward with. |
| **Interview** | `Interview` | **Interview** | Set manually when an interview is scheduled. |
| **Rejected** | `Rejected` | **Rejected** | Set manually if the candidate is not a fit for the role. |
| **Hired** | `Hired` | **Hired** | The final successful state when a candidate is offered and accepts the position. |

## The Automated Flow

1. **Submission**: Candidate applies $\rightarrow$ Status: `Applied`.
2. **Screening Start**: Recruiter clicks "Run AI Screening" $\rightarrow$ Backend updates all applications to `Under Review`.
3. **AI Analysis**: Gemini analyzes the resume/profile against job requirements.
4. **Completion**: Once analysis is saved to the `Screenings` collection, the Backend updates the individual `Application` status to `Screened`.

## Data Synchronization

- **Applicant Portal**: Always displays the status from the `Application` collection in the database.
- **Recruiter Dashboard**: Displays the real-time status and provides controls to transition candidates between `Shortlisted`, `Interview`, `Hired`, and `Rejected`.

## Status Mapping Reference

In the frontend, for visual consistency with candidate expectations:
- `Applied` is displayed as `Submitted`.
- The status timeline shows: **Submitted** $\rightarrow$ **Under Review** $\rightarrow$ **Screened** $\rightarrow$ **Shortlisted**.
