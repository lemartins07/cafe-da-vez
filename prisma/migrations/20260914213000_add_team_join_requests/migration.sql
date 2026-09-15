-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "team_join_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "resolved_by_id" UUID,

    CONSTRAINT "team_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_join_requests_profile_id_status_idx" ON "team_join_requests"("profile_id", "status");

-- CreateIndex
CREATE INDEX "team_join_requests_team_id_status_idx" ON "team_join_requests"("team_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "team_join_requests_one_pending_per_profile_team"
ON "team_join_requests"("team_id", "profile_id")
WHERE "status" = 'PENDING';

-- AddForeignKey
ALTER TABLE "team_join_requests"
ADD CONSTRAINT "team_join_requests_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_join_requests"
ADD CONSTRAINT "team_join_requests_profile_id_fkey"
FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_join_requests"
ADD CONSTRAINT "team_join_requests_resolved_by_id_fkey"
FOREIGN KEY ("resolved_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
