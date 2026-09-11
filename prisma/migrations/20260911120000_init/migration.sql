-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "RotationType" AS ENUM ('MAKE_COFFEE', 'BUY_COFFEE');

-- CreateEnum
CREATE TYPE "TurnAction" AS ENUM ('COMPLETED', 'SKIPPED', 'PAUSED', 'RESUMED', 'REORDERED', 'UNDONE');

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allowed_emails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allowed_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "team_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id","profile_id")
);

-- CreateTable
CREATE TABLE "rotations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "type" "RotationType" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "current_position" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotation_members" (
    "rotation_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rotation_members_pkey" PRIMARY KEY ("rotation_id","profile_id")
);

-- CreateTable
CREATE TABLE "turn_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rotation_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "subject_name" VARCHAR(120) NOT NULL,
    "action" "TurnAction" NOT NULL,
    "reason" VARCHAR(500),
    "request_id" UUID NOT NULL,
    "performed_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turn_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "allowed_emails_email_idx" ON "allowed_emails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "allowed_emails_team_id_email_key" ON "allowed_emails"("team_id", "email");

-- CreateIndex
CREATE INDEX "team_members_profile_id_idx" ON "team_members"("profile_id");

-- CreateIndex
CREATE INDEX "rotations_team_id_idx" ON "rotations"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotations_team_id_type_key" ON "rotations"("team_id", "type");

-- CreateIndex
CREATE INDEX "rotation_members_profile_id_idx" ON "rotation_members"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "rotation_members_rotation_id_position_key" ON "rotation_members"("rotation_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "turn_events_request_id_key" ON "turn_events"("request_id");

-- CreateIndex
CREATE INDEX "turn_events_rotation_id_created_at_idx" ON "turn_events"("rotation_id", "created_at");

-- CreateIndex
CREATE INDEX "turn_events_subject_id_idx" ON "turn_events"("subject_id");

-- CreateIndex
CREATE INDEX "turn_events_performed_by_id_idx" ON "turn_events"("performed_by_id");

-- AddForeignKey
ALTER TABLE "allowed_emails" ADD CONSTRAINT "allowed_emails_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotations" ADD CONSTRAINT "rotations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation_members" ADD CONSTRAINT "rotation_members_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "rotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotation_members" ADD CONSTRAINT "rotation_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turn_events" ADD CONSTRAINT "turn_events_rotation_id_fkey" FOREIGN KEY ("rotation_id") REFERENCES "rotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turn_events" ADD CONSTRAINT "turn_events_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turn_events" ADD CONSTRAINT "turn_events_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
