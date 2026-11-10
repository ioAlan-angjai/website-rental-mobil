import prisma from "@/lib/prisma";

export async function createIndexes() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "cars_status_idx" ON "cars"("status");
      CREATE INDEX IF NOT EXISTS "cars_category_idx" ON "cars"("category");
      CREATE INDEX IF NOT EXISTS "cars_transmission_idx" ON "cars"("transmission");
      CREATE INDEX IF NOT EXISTS "cars_pricePerDay_idx" ON "cars"("pricePerDay");
      CREATE INDEX IF NOT EXISTS "cars_createdAt_idx" ON "cars"("createdAt");
      
      CREATE INDEX IF NOT EXISTS "bookings_carId_idx" ON "bookings"("carId");
      CREATE INDEX IF NOT EXISTS "bookings_userId_idx" ON "bookings"("userId");
      CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings"("status");
      CREATE INDEX IF NOT EXISTS "bookings_startDateTime_idx" ON "bookings"("startDateTime");
      CREATE INDEX IF NOT EXISTS "bookings_endDateTime_idx" ON "bookings"("endDateTime");
      CREATE INDEX IF NOT EXISTS "bookings_composite_idx" ON "bookings"("carId", "status", "startDateTime", "endDateTime");
    `);
    console.log("✓ Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}
