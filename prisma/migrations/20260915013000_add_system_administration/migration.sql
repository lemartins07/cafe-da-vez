-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('USER', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- AlterTable
ALTER TABLE "profiles"
ADD COLUMN "system_role" "SystemRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teams"
ADD COLUMN "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "disabled_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "profiles_system_role_idx" ON "profiles"("system_role");

-- CreateIndex
CREATE INDEX "teams_status_idx" ON "teams"("status");
