# Employer Dashboard — Use Case Mapping

## System Use Cases (Employer Module)
From the ASTU-AMS system specification, the Employer Module defines 7 use cases:

| # | Use Case | Frontend Tab | Component | Status |
|---|----------|-------------|-----------|--------|
| 1 | Manage Company Profile | `profile` | `CompanyProfileTab` | Kept |
| 2 | Post Jobs | `post_job` | `JobPostingTab` | Kept |
| 3 | Publish/Close Jobs | `post_job` | `JobPostingTab` | Kept |
| 4 | Manage Applications | `candidates` | `ApplicationsTab` | Kept |
| 5 | Search Alumni Talent | `search_talent` | `TalentSearchTab` | Kept |
| 6 | Schedule Interviews | `candidates` | *(via shortlisting)* | Kept |
| 7 | Submit Competency Feedback | `feedback` | `FeedbackTab` | Kept |

## Features Removed (not in use cases)

| Removed Tab | Reason |
|-------------|--------|
| `chat` (Messages) | Messaging between employers and alumni is not listed as an employer use case |
| `analytics` (Analytics) | Analytics is a separate module (Module 7) for Department Heads and Admin |
| `management` (Management Hub) | Meta-tab; each action now lives in its feature tab |

## Mock Data Cleaned

All files in `frontend/src/domains/employers/services/mockEmployerData.ts`:
- `getCompanyProfile()` → returns empty `CompanyProfile`
- `getEmployerJobs()` → returns `[]`
- `getCandidateApplications()` → returns `[]`
- `getGraduateFeedback()` → returns `[]`
- All `save*` functions → no-op (no localStorage)
- Removed: `getEmployerMessages()`, `saveEmployerMessages()`, `Message` type

## How to Connect to Backend

Each service function in `mockEmployerData.ts` is the contract. Replace the body with
a real `fetch`/`axios` call when the backend API is ready:

```
// Current stub:
export const getCompanyProfile = (): CompanyProfile => ({ ...emptyProfile });

// Future API call:
export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const res = await fetch('/api/employer/profile', { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
};
```

The component props already match the TypeScript interfaces in `employer.types.ts`.
No component changes are needed — just swap the service layer.
