-- Add an explicit "no status reported" value and stop defaulting to UNEMPLOYED.
--
-- Previously employmentStatus defaulted to UNEMPLOYED, so any profile created
-- without a status was silently counted as unemployed in department analytics.
-- Existing rows that were never given a real status are re-labelled
-- UNSPECIFIED rather than being left as an invented unemployment count.

-- AlterEnum
CREATE TYPE "EmploymentStatus_new" AS ENUM ('EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'UNSPECIFIED');

ALTER TABLE "AlumniProfile"
    ALTER COLUMN "employmentStatus" DROP DEFAULT,
    ALTER COLUMN "employmentStatus" TYPE "EmploymentStatus_new" USING ("employmentStatus"::text::"EmploymentStatus_new");

ALTER TYPE "EmploymentStatus" RENAME TO "EmploymentStatus_old";
ALTER TYPE "EmploymentStatus_new" RENAME TO "EmploymentStatus";

DROP TYPE "EmploymentStatus_old";

-- Restore the honest default.
ALTER TABLE "AlumniProfile" ALTER COLUMN "employmentStatus" SET DEFAULT 'UNSPECIFIED';
