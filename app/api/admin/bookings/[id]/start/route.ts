import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Mulai sewa (admin only)
// Mengubah status booking dari DP_CONFIRMED menjadi IN_PROGRESS dan mobil menjadi BOOKED
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Cek role admin
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat memulai sewa" },
        { status: 403 }
      );
    }

    const { id: bookingId } = params;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    if (booking.status !== "DP_CONFIRMED") {
      return NextResponse.json(
        { error: "Sewa hanya dapat dimulai jika status DP sudah dikonfirmasi (DP_CONFIRMED)" },
        { status: 400 }
      );
    }

    // Database transaction
    const [updatedBooking] = await prisma.$transaction([
      // 1. Update Booking status to IN_PROGRESS
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "IN_PROGRESS" }
      }),

      // 2. Set car status to BOOKED
      prisma.car.update({
        where: { id: booking.carId },
        data: { status: "BOOKED" }
      })
    ]);

    // Create notification untuk user
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Sewa Mobil Dimulai",
          message: `Mobil ${booking.car.name} telah diserahterimakan. Selamat menikmati perjalanan Anda!`,
          type: "RENTAL_STARTED"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sewa mobil berhasil dimulai.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Start rental error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memulai sewa" },
      { status: 500 }
    );
  }
}
