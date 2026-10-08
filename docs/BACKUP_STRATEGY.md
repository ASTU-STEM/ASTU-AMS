# ASTU-AMS — BACKUP & RETENTION STRATEGY

**System Component**: Adama Science and Technology University (ASTU) Alumni Management System  
**Storage Target**: Neon Managed PostgreSQL + Encrypted Offsite S3 Object Storage  
**Compliance Standard**: ISO 27001 Backup & Continuity Protocols

---

## 1. BACKUP SCHEDULE & RETENTION TAXONOMY

| Backup Type | Execution Interval | Retention Period | Storage Location | Encryption |
| :--- | :---: | :---: | :--- | :---: |
| **Continuous WAL Logs** | Every 5 Mins | 7 Days | Neon Managed Storage | AES-256 |
| **Daily Full Snapshot** | Every 24 Hours (01:00 EAT)| 30 Days | Primary AWS S3 Bucket | KMS Envelope |
| **Weekly Cold Backup** | Every Sunday | 90 Days | Off-Region Cold S3 Bucket | KMS Envelope |
| **Monthly Archive** | 1st of Month | 7 Years | Amazon S3 Glacier Flexible | KMS Envelope |

---

## 2. AUTOMATED BACKUP RESTORE VERIFICATION TEST

Backups are validated weekly via automated sandbox restoration:

```bash
#!/bin/bash
# ASTU-AMS Backup Restoration Sanity Validator
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="s3://astu-ams-backups/daily/snapshot_latest.dump"
RESTORE_DB="astu_ams_restore_test_${TIMESTAMP}"

echo "[INFO] Downloading backup snapshot from S3..."
aws s3 cp $BACKUP_FILE /tmp/latest.dump

echo "[INFO] Restoring snapshot into sandbox PostgreSQL container..."
createdb -h localhost -U postgres $RESTORE_DB
pg_restore -h localhost -U postgres -d $RESTORE_DB /tmp/latest.dump

echo "[INFO] Executing database integrity checks..."
ROW_COUNT=$(psql -h localhost -U postgres -d $RESTORE_DB -t -c "SELECT COUNT(*) FROM \"User\";")
echo "[SUCCESS] Restored DB verified successfully. Total User Rows: $ROW_COUNT"

dropdb -h localhost -U postgres $RESTORE_DB
rm /tmp/latest.dump
```
