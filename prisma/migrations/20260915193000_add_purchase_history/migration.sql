-- AlterTable
ALTER TABLE "turn_events"
ADD COLUMN "occurred_on" DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN "purchased_coffee" BOOLEAN,
ADD COLUMN "purchased_filters" BOOLEAN,
ADD CONSTRAINT "turn_events_purchase_items_consistent"
  CHECK (("purchased_coffee" IS NULL) = ("purchased_filters" IS NULL));

-- CreateIndex
CREATE INDEX "turn_events_rotation_id_occurred_on_idx"
ON "turn_events"("rotation_id", "occurred_on");
