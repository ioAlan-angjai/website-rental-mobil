import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PENALTY_CONFIG } from "@/lib/constants";

// POST: Proses pengembalian mobil & pelunasan (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Cek role admin
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat memproses pengembalian mobil" },
        { status: 403 }
      );
    }

    const { id: bookingId } = params;
    const body = await req.json();
    const { actualReturnDate, paymentMethod = "CASH" } = body;

    if (!actualReturnDate) {
      return NextResponse.json(
        { error: "Tanggal pengembalian aktual harus diisi" },
        { status: 400 }
      );
    }

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

    if (booking.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Mobil harus berstatus Sedang Berjalan (IN_PROGRESS) untuk dikembalikan" },
        { status: 400 }
      );
    }

    const returnTime = new Date(actualReturnDate);
    const endTime = new Date(booking.endDate);

    // Hitung denda (jika telat)
    let penaltyAmount = 0;
    const diffTimeMs = returnTime.getTime() - endTime.getTime();

    // Cek apakah melewati grace period (30 menit)
    const diffMinutes = Math.floor(diffTimeMs / (1000 * 60));
    if (diffMinutes > PENALTY_CONFIG.GRACE_PERIOD_MINUTES) {
      const diffHours = Math.ceil(diffTimeMs / (1000 * 60 * 60));
      
      // Jika melewati threshold jam (misal 6 jam), denda disamakan dengan harga sewa full day
      if (diffHours >= PENALTY_CONFIG.PENALTY_THRESHOLD_HOURS) {
        penaltyAmount = booking.car.pricePerDay;
      } else {
        penaltyAmount = diffHours * PENALTY_CONFIG.PENALTY_PER_HOUR;
      }
    }

    const remainingAmount = booking.totalPrice - booking.dpAmount;
    const totalPaymentRequired = remainingAmount + penaltyAmount;

    // Database transaction
    const [updatedBooking] = await prisma.$transaction([
      // 1. Update Booking status to COMPLETED, fullPaid to true, save penalty
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
          fullPaid: true,
          penaltyAmount: penaltyAmount,
          totalPrice: booking.totalPrice + penaltyAmount,
          notes: penaltyAmount > 0 ? `Telat pengembalian. Denda Rp ${penaltyAmount.toLocaleString('id-ID')}` : booking.notes,
        }
      }),

      // 2. Set car status back to AVAILABLE
      prisma.car.update({
        where: { id: booking.carId },
        data: { status: "AVAILABLE" }
      }),

      // 3. Create payment record for pelunasan + denda
      prisma.payment.create({
        data: {
          bookingId,
          amount: totalPaymentRequired,
          type: "FULL_PAYMENT",
          method: paymentMethod,
          status: "VERIFIED", // Langsung terverifikasi karena diinput oleh admin
          verifiedAt: new Date(),
          verifiedBy: session.user?.email || "admin",
          rejectReason: penaltyAmount > 0 ? `Termasuk denda keterlambatan Rp ${penaltyAmount.toLocaleString('id-ID')}` : null,
        }
      })
    ]);

    // Create notification untuk user jika booking terhubung ke user
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Rental Selesai & Lunas",
          message: `Mobil ${booking.car.name} telah dikembalikan. Pelunasan telah diverifikasi oleh admin. Terima kasih!`,
          type: "RENTAL_COMPLETED"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Mobil berhasil dikembalikan dan pembayaran telah lunas.",
      booking: updatedBooking,
      penaltyAmount,
      totalPaymentRequired
    });

  } catch (error) {
    console.error("Return car error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pengembalian mobil" },
      { status: 500 }
    );
  }
}
