import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/booking/[id]/cancel — User membatalkan booking sendiri
// Hanya bisa jika status PENDING atau WAITING_DP (sebelum DP diverifikasi admin)
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { id: bookingId } = params;
    const currentUserId = (session.user as any).id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Pemesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pastikan booking milik user yang request
    if (booking.userId && booking.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke pemesanan ini" },
        { status: 403 }
      );
    }

    // Hanya bisa cancel jika DP belum diverifikasi
    const cancellableStatuses = ["PENDING", "WAITING_DP"];
    if (!cancellableStatuses.includes(booking.status)) {
      return NextResponse.json(
        {
          error:
            booking.status === "DP_CONFIRMED" || booking.status === "IN_PROGRESS"
              ? "Booking tidak dapat dibatalkan setelah DP dikonfirmasi. Hubungi admin."
              : "Booking ini tidak dapat dibatalkan.",
        },
        { status: 400 }
      );
    }

    // Batalkan booking + kembalikan mobil ke AVAILABLE dalam satu transaksi
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      }),
      prisma.car.update({
        where: { id: booking.carId },
        data: { status: "AVAILABLE" },
      }),
    ]);

    // Batalkan semua payment PENDING terkait
    await prisma.payment.updateMany({
      where: { bookingId, status: "PENDING" },
      data: { status: "REJECTED", rejectReason: "Dibatalkan oleh penyewa" },
    });

    // Notifikasi ke admin
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Booking Dibatalkan oleh Penyewa",
          message: `Booking ${bookingId} (${booking.car?.name || ""}) telah dibatalkan oleh penyewa. Mobil kembali tersedia.`,
          type: "BOOKING_CREATED_ADMIN",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Booking berhasil dibatalkan. Mobil kembali tersedia.",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membatalkan booking" },
      { status: 500 }
    );
  }
}
