-- Add the CMS_MANAGER role.
--
-- Both guards already accepted it:
--   backend/src/modules/content/presentation/content.routes.ts  -> cmsRoles
--   frontend/src/App.tsx  -> allowedRoles for /cms
-- but "CMS_MANAGER" was not a member of the Role enum, so the database could
-- never store it and no dedicated content-management account could exist.
-- Content staff had to be given a full ADMIN account instead.

-- AlterEnum
DO $$ BEGIN
    CREATE TYPE "Role_new" AS ENUM (
        'ADMIN',
        'SUPER_ADMIN',
        'CMS_MANAGER',
        'ALUMNI',
        'EMPLOYER',
        'DEPARTMENT_HEAD',
        'REGISTRAR',
        'ALUMNI_OFFICE'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "User"
        ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
EXCEPTION
    WHEN others THEN NULL;
END $$;

DROP TYPE IF EXISTS "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
