# ASTU-AMS — DATA PRIVACY & GOVERNANCE ARCHITECTURE

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Governance Standards**: ISO/IEC 27701 Privacy Information Management | National Higher Education Data Governance Guidelines  
**Classification Levels**: PUBLIC | INTERNAL | CONFIDENTIAL | HIGHLY CONFIDENTIAL

---

## 1. DATA CLASSIFICATION & ENCRYPTION MATRIX

| Data Element | Privacy Tier | Storage State | In-Transit State | Masking / Anonymization Strategy |
| :--- | :---: | :---: | :---: | :--- |
| **Passwords & Secrets** | `HIGHLY CONFIDENTIAL` | Bcrypt Hash (Cost=12) | TLS 1.3 | Never logged or returned in responses |
| **National ID / Phone / Email**| `CONFIDENTIAL` | AES-256 Encrypted | TLS 1.3 | Masked on public views (`ab***@astu.edu.et`) |
| **Salary Data & Income** | `CONFIDENTIAL` | PostgreSQL Encrypted | TLS 1.3 | Aggregated in reporting (averages/medians only) |
| **Alumni Employment Status**| `INTERNAL` | Standard Column | TLS 1.3 | Visible to verified employers & department heads |
| **Public Job Postings** | `PUBLIC` | Standard Column | TLS 1.3 | Open public access |

---

## 2. ANONYMIZATION & MINISTRY REPORTING

To enable future **Ministry of Education** national employment research without violating individual alumni privacy:

1. **Statistical Aggregation Rules**:
   - Aggregate statistics require a minimum group size of $N \ge 10$ respondents.
   - Cohort views omit individual names, exact phone numbers, and student IDs.

2. **Data Export Controls**:
   - All bulk CSV/Excel exports trigger an audit log record containing `userId`, `exportType`, `rowCount`, and `timestamp`.
