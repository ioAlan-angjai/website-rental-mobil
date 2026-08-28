import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/bookings/[id]/cancel — Admin membatalkan booking paksa
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat membatalkan booking" },
        { status: 403 }
      );
    }

    const { id: bookingId } = params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true, payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    // Cancel — semua status bisa di-cancel admin paksa
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      }),
      prisma.car.update({
        where: { id: booking.carId },
        data: { status: "AVAILABLE" },
      }),
      // Reject semua payment yang masih PENDING
      prisma.payment.updateMany({
        where: { bookingId, status: "PENDING" },
        data: { status: "REJECTED", rejectReason: "Dibatalkan oleh admin" },
      }),
    ]);

    // Notifikasi ke user jika ada
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Booking Dibatalkan oleh Admin",
          message: `Booking ${booking.car?.name || ""} Anda telah dibatalkan oleh admin. Silakan hubungi customer service untuk informasi lebih lanjut.`,
          type: "BOOKING_REJECTED",
        },
      });
    }

    return NextResponse.json({ success: true, message: "Booking berhasil dibatalkan oleh admin." });

  } catch (error) {
    console.error("Admin cancel error:", error);
    return NextResponse.json(
      { error: "Gagal membatalkan booking" },
      { status: 500 }
    );
  }
}
