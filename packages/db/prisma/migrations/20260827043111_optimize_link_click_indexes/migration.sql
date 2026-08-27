-- DropIndex
DROP INDEX "Link_shortCode_idx";

-- CreateIndex
CREATE INDEX "Click_clickedAt_idx" ON "Click"("clickedAt");
