-- Align the database with what the application code already expects.
-- These columns/enum values are referenced in code but were never declared in
-- prisma/schema.prisma, so a fresh `prisma migrate dev` would have dropped them.

-- Role: SUPER_ADMIN is used by ManageUsers, LoginUser, adminRoutes and the frontend.
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- SupportTicketStatus: ICT triage state used by the support controller.
DO $$ BEGIN
  ALTER TYPE "SupportTicketStatus" ADD VALUE IF NOT EXISTS 'PENDING_ICT_ADMIN';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- SupportTicket.assignedToRole: which staff role the ticket is routed to.
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "assignedToRole" TEXT;

-- Notification.status: delivery state ("Sent" / "Scheduled").
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Sent';

-- Survey department scoping (already added by 20260924180000 on some databases;
-- declared idempotently here so every environment ends up in the same state).
ALTER TABLE "Survey" ADD COLUMN IF NOT EXISTS "departmentId" TEXT;
ALTER TABLE "Survey" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Survey" ADD CONSTRAINT "Survey_departmentId_fkey"
    FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Survey" ADD CONSTRAINT "Survey_createdByUserId_fkey"
    FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
