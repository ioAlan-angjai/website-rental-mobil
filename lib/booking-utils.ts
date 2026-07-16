import prisma from "@/lib/prisma";

export async function updateInProgressBookings() {
  try {
    const now = new Date();
    
    // Find all bookings with status DP_CONFIRMED that have already started
    const bookingsToStart = await prisma.booking.findMany({
      where: {
        status: "DP_CONFIRMED",
        startDate: { lte: now }
      }
    });

    if (bookingsToStart.length > 0) {
      for (const booking of bookingsToStart) {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: { status: "IN_PROGRESS" }
          }),
          prisma.car.update({
            where: { id: booking.carId },
            data: { status: "BOOKED" }
          })
        ]);
        
        if (booking.userId) {
          const car = await prisma.car.findUnique({ where: { id: booking.carId } });
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Sewa Mobil Dimulai",
              message: `Mobil ${car?.name || ''} telah diserahterimakan. Selamat menikmati perjalanan Anda!`,
              type: "RENTAL_STARTED"
            }
          });
        }
      }
    }
  } catch (error) {
    console.error("Error auto-updating bookings to IN_PROGRESS:", error);
  }
}
