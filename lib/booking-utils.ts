import prisma from "@/lib/prisma";

// Otomatis ubah booking DP_CONFIRMED -> IN_PROGRESS saat waktu sewa dimulai
export async function updateInProgressBookings() {
  try {
    const now = new Date();

    const bookingsToStart = await prisma.booking.findMany({
      where: {
        status: "DP_CONFIRMED",
        startDateTime: { lte: now },
      },
    });

    for (const booking of bookingsToStart) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "IN_PROGRESS" },
        }),
        prisma.car.update({
          where: { id: booking.carId },
          data: { status: "BOOKED" },
        }),
      ]);

      if (booking.userId) {
        const car = await prisma.car.findUnique({ where: { id: booking.carId } });
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Sewa Mobil Dimulai",
            message: `Mobil ${car?.name || ""} telah diserahterimakan. Selamat menikmati perjalanan Anda!`,
            type: "RENTAL_STARTED",
          },
        });
      }
    }
  } catch (error) {
    console.error("Error auto-updating bookings to IN_PROGRESS:", error);
  }
}

// Notifikasi "hampir habis" 2 jam sebelum endDateTime (hindari spam via cek notifikasi existing)
export async function processNearExpiryBookings() {
  try {
    const now = new Date();
    const threshold = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 jam ke depan

    const nearExpiry = await prisma.booking.findMany({
      where: {
        status: "IN_PROGRESS",
        endDateTime: { gt: now, lte: threshold },
      },
      include: { car: true },
    });

    for (const booking of nearExpiry) {
      if (!booking.userId) continue;
      const existing = await prisma.notification.findFirst({
        where: { userId: booking.userId, type: "RENTAL_NEAR_EXPIRY" },
      });
      if (existing) continue; // jangan spam

      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Waktu Sewa Hampir Habis",
          message: `Waktu sewa mobil ${booking.car.name} akan berakhir dalam 2 jam. Silakan bersiap untuk pengembalian.`,
          type: "RENTAL_NEAR_EXPIRY",
        },
      });
    }
  } catch (error) {
    console.error("Error processing near-expiry bookings:", error);
  }
}

// Jalankan semua scheduler sekaligus (dipanggil dari cron/admin)
export async function runScheduler() {
  await updateInProgressBookings();
  await processNearExpiryBookings();
  await processExpiryBookings();
}

// Otomatis ubah IN_PROGRESS -> WAITING_RETURN saat endDateTime lewat + notifikasi "waktu habis"
export async function processExpiryBookings() {
  try {
    const now = new Date();

    const expired = await prisma.booking.findMany({
      where: {
        status: "IN_PROGRESS",
        endDateTime: { lt: now },
      },
      include: { car: true },
    });

    for (const booking of expired) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "WAITING_RETURN" },
      });

      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Waktu Booking Telah Habis",
            message: `Waktu booking mobil ${booking.car.name} telah selesai. Silakan lakukan pengembalian mobil dan pelunasan jika masih ada tagihan.`,
            type: "RENTAL_EXPIRED",
          },
        });
      }
    }
  } catch (error) {
    console.error("Error processing expiry bookings:", error);
  }
}
