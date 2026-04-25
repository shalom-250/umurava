# Schema

## 3.1 Basic Information

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| firstName | string | Yes | Talent's first name |
| lastName | string | Yes | Talent's last name |
| email | string | Yes | Unique email address |
| phone | string | No | Contact phone number |
| headline | string | No | Short professional summary |
| bio | string | No | Detailed professional biography |
| location | string | No | Current location (City, Country) |
| nationality | string | No | Talent's nationality |
| dob | string | No | Date of birth |
| personalStatement | string | No | Personal statement |

## 3.2 Skills & Languages

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| skills | object[] | No | List of skills with proficiency and experience |
| languages | object[] | No | Spoken languages |

### skills object Example
```json
{
  "name": "Node.js",
  "level": "Beginner | Intermediate | Advanced | Expert",
  "yearsOfExperience": 3,
  "type": "Technical | Soft | Other"
}
```

### languages object Example
```json
{
  "name": "English",
  "proficiency": "Basic | Conversational | Fluent | Native"
}
```

## 3.3 Work Experience

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| experience | object[] | No | Professional experience history |

### experience object example
```json
{
  "company": "Company Name",
  "role": "Backend Engineer",
  "location": "City, Country",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM | Present",
  "description": "Key responsibilities and achievements",
  "achievements": ["Achievement 1", "Achievement 2"],
  "technologies": ["Node.js", "PostgreSQL"],
  "isCurrent": true
}
```

## 3.4 Education

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| education | object[] | No | Academic background |

### education object example
```json
{
  "institution": "University Name",
  "degree": "Bachelor's",
  "fieldOfStudy": "Computer Science",
  "location": "City, Country",
  "startYear": 2020,
  "endYear": 2024,
  "achievements": ["Graduated with honors"]
}
```

## 3.5 Certifications

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| certifications | object[] | No | Professional certifications |

### certification object example
```json
{
  "name": "AWS Certified Developer",
  "issuer": "Amazon",
  "issueDate": "YYYY-MM"
}
```

## 3.6 Projects

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| projects | object[] | No | Portfolio projects |

### project object example
```json
{
  "name": "AI Recruitment System",
  "description": "AI-powered candidate screening platform",
  "technologies": ["Next.js", "Node.js", "Gemini API"],
  "role": "Backend Engineer",
  "link": "https://...",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM"
}
```

## 3.7 Availability

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| availability | object | No | Talent availability |

### availability object example
```json
{
  "status": "Available | Open to Opportunities | Not Available",
  "type": "Full-time | Part-time | Contract",
  "startDate": "YYYY-MM-DD"
}
```

## 3.8 Social Links

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| socialLinks | object | No | External profiles |

### socialLinks object example
```json
{
  "linkedin": "https://linkedin.com/...",
  "github": "https://github.com/...",
  "portfolio": "https://...",
  "website": "https://..."
}
```

## 4.1 User

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | User's full name |
| email | string | Yes | Unique email address |
| password | string | Yes | Password hash |
| role | string | No | User role (recruiter, admin, applicant) |
| createdAt | Date | No | Creation timestamp |

## 4.2 Job

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| title | string | Yes | Job title |
| description | string | Yes | Detailed job description |
| requirements | string[] | No | List of job requirements |
| skills | string[] | No | Preferred skills |
| mustHaveSkills | string[] | No | Mandatory skills |
| recruiterId | ObjectId | Yes | Reference to User (Recruiter) |
| department | string | No | Department name |
| location | string | No | Job location |
| type | string | No | Job type (Full-time, Part-time, Contract) |
| experienceLevel | string | No | Experience level required |
| salaryRange | string | No | Expected salary range |
| deadline | string | No | Application deadline |
| requiredDocuments| string[] | No | Documents required for application |
| lastScreenedAt | Date | No | Last time applications were screened |
| status | string | No | Job status (Active, Draft, Screening, Closed) |
| createdAt | Date | No | Creation timestamp |

## 4.3 Application

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| jobId | ObjectId | Yes | Reference to Job |
| candidateId | ObjectId | Yes | Reference to Candidate |
| status | string | No | Application status (Applied, Screened, etc.) |
| appliedAt | Date | No | Application timestamp |
| attachments | object[] | No | Array of document attachments (name, url) |
| updatedAt | Date | No | Last update timestamp |

## 4.4 Screening

| Field Name | Type | Required | Description |
| --- | --- | --- | --- |
| jobId | ObjectId | Yes | Reference to Job |
| candidateId | ObjectId | Yes | Reference to Candidate |
| score | number | Yes | Total screening score |
| rank | number | Yes | Candidate rank position |
| weightedScore | object | No | Sub-scores (skills, experience, education) |
| relevance | number | No | Relevance percentage |
| strengths | string | No | AI identified strengths |
| gaps | string | No | AI identified gaps |
| aiReasoning | string | No | AI's reasoning for score |
| recommendation | string | No | AI recommendation (Shortlist, Waitlist, Reject) |
| interviewQuestions | string[] | No | Suggested interview questions |
| skillBreakdown | object[] | No | Breakdown of skill scoring |
| documentStatus | object[] | No | Status of documents (completed, missing, url) |
| createdAt | Date | No | Timestamp |
