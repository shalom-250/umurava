# Database Documentation - UMURAVA SCREENING AI

The system uses **MongoDB** as its primary database. Below are the 15 documented schemas used in the platform.

## 1. User
Manages recruiters and administrators.
- **name**: String
- **email**: String (Unique)
- **password**: String (Hashed)
- **role**: Enum ['recruiter', 'admin']

## 2. Job
Stores job openings and specs.
- **title**: String
- **description**: String
- **requirements**: String[]
- **skills**: String[]
- **mustHaveSkills**: String[]

## 3. Candidate
Stores talent profiles and parsed text.
- **name**: String
- **email**: String
- **skills**: String[]
- **extractedText**: String

## 4. Screening
AI-generated ranking results.
- **jobId**, **candidateId**: Refs
- **score**, **rank**: Numbers
- **weightedScore**: { skills, experience, education }
- **interviewQuestions**: String[]

## 5. Application
Tracks the hiring lifecycle.
- **status**: Enum ['Applied' to 'Hired']

## 6. Interview
Scheduling and logistics for meetings.
- **type**: Enum ['Technical', 'Behavioral', 'HR']
- **scheduledAt**: Date

## 7. Review
Detailed recruiter feedback on applications.
- **score**: 0-10
- **recommendation**: Enum ['Pass', 'Fail', 'Strong Pass']

## 8. Company
Corporate profiles for hiring entities.

## 9. Department
Internal organizational units.

## 10. Notification
Real-time sys alerts for users.

## 11. Skill
Master taxonomy of standardized skills.

## 12. Message
Internal chat logs between system users.

## 13. AuditLog
Security logs tracking system actions.

## 14. Settings
User-specific preferences (Theme, Language).

## 15. Subscription
SaaS tier management for companies.
