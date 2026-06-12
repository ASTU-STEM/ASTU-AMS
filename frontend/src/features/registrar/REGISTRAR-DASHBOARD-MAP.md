# Registrar Dashboard — Use Case Mapping

## System Use Cases (Registrar Module)
From the ASTU-AMS system specification:

| # | Use Case | Frontend Tab | Component | Status |
|---|----------|-------------|-----------|--------|
| 1 | Verify Student ID (Public) | `verification` | `VerificationTab` | Kept |
| 2 | Import Graduate Records (Excel/CSV) | `data_integration` | `DataIntegrationTab` | Kept |
| 3 | Fetch Graduates via API | `data_integration` | `DataIntegrationTab` | Kept |
| 4 | View Data Sync Logs | `data_integration` | `DataIntegrationTab` | Kept |
| 5 | Manage Verified Alumni | `records` | `RecordsTab` | Kept |
| 6 | Update Alumni Status | `verification` | `VerificationTab` | Kept |
| 7 | Process Document Requests | `documents` | `DocumentProcessingTab` | Kept |

## Features Removed (not in use cases)

| Removed Tab | Reason |
|-------------|--------|
| `management` (Management Hub) | Meta-tab; each action now lives in its feature tab |
| `surveys` (Tracer Surveys) | Surveys is Module 6 — for Alumni and Admin, not Registrar |
| `reporting` (Reports & Export) | Not listed as a registrar use case |
| `messages` (Internal Messaging) | Not listed as a registrar use case |

## Mock Data Cleaned

`mockRegistrarData.ts`:
- `getGraduates()` → returns `[]`
- `getVerifications()` → returns `[]`
- `getDocumentRequests()` → returns `[]`
- All `save*` functions → no-op (no localStorage)

## Hardcoded Data Removed from Dashboard

- Fake notification seed data (3 hardcoded alerts)
- Fake stat padding (`+23800` on graduates, `+18200` on verified alumni)
- Hardcoded profile name "Dr. Abebe Assefa"
- `AnalyticsChart` with hardcoded submission/rating data
- `ActivityTimeline` with 4 fake entries
- `registrarControlCards` referencing removed tabs
- `registrarCommandSignals` and `registrarManagementActions` referencing `reporting` tab
- `complianceSignals` and `dataQualityPanels` arrays (not mapped to use cases)

## How to Connect to Backend

Each service function in `mockRegistrarData.ts` is the contract. Replace with real API:

```
// Current stub:
export const getGraduates = (): GraduateRecord[] => [];

// Future API call:
export const getGraduates = async (): Promise<GraduateRecord[]> => {
  const res = await fetch('/api/registrar/graduates', { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
};
```

Component props match the TypeScript interfaces in `registrar.types.ts`. No component changes needed — just swap the service layer.
