-- AlterTable
ALTER TABLE "Survey" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
ALTER TABLE "Survey" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Survey_departmentId_idx" ON "Survey"("departmentId");
CREATE INDEX IF NOT EXISTS "Survey_createdByUserId_idx" ON "Survey"("createdByUserId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Survey" ADD CONSTRAINT "Survey_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
