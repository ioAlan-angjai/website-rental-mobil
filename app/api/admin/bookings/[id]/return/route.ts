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
    const endTime = new Date(booking.endDateTime);

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

    const finalTotal = booking.totalPrice + penaltyAmount;
    const alreadyPaid = booking.dpAmount;
    const remainingAmount = Math.max(0, finalTotal - alreadyPaid);

    const isFullyPaidNow = remainingAmount === 0;

    // Database transaction
    const [updatedBooking] = await prisma.$transaction([
      // 1. Update Booking: simpan penalty + total akhir, tentukan status
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          penaltyAmount: penaltyAmount,
          totalPrice: finalTotal,
          status: isFullyPaidNow ? "COMPLETED" : "WAITING_PAYMENT",
          fullPaid: isFullyPaidNow,
          notes: penaltyAmount > 0
            ? `Telat pengembalian. Denda Rp ${penaltyAmount.toLocaleString('id-ID')}`
            : booking.notes,
        }
      }),

      // 2. Set car status back to AVAILABLE
      prisma.car.update({
        where: { id: booking.carId },
        data: { status: "AVAILABLE" }
      }),

      // 3. Create payment record untuk pelunasan (+ denda jika ada)
      // Jika lunas saat itu (cash), langsung VERIFIED. Jika masih ada sisa, PENDING (menunggu user bayar).
      prisma.payment.create({
        data: {
          bookingId,
          amount: remainingAmount,
          type: "FULL_PAYMENT",
          method: paymentMethod,
          status: isFullyPaidNow ? "VERIFIED" : "PENDING",
          verifiedAt: isFullyPaidNow ? new Date() : null,
          verifiedBy: isFullyPaidNow ? (session.user?.email || "admin") : null,
          rejectReason: penaltyAmount > 0 && !isFullyPaidNow
            ? `Termasuk denda keterlambatan Rp ${penaltyAmount.toLocaleString('id-ID')}`
            : null,
        }
      })
    ]);

    // Notifikasi ke user
    if (booking.userId) {
      if (isFullyPaidNow) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Rental Selesai & Lunas",
            message: `Mobil ${booking.car.name} telah dikembalikan. Pelunasan telah lunas. Terima kasih!`,
            type: "RENTAL_COMPLETED"
          }
        });
      } else {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Tagihan Pelunasan Tersedia",
            message: `Mobil ${booking.car.name} telah dikembalikan. Sisa pembayaran pelunasan sebesar Rp ${remainingAmount.toLocaleString('id-ID')}${penaltyAmount > 0 ? ` (termasuk denda Rp ${penaltyAmount.toLocaleString('id-ID')})` : ''}. Silakan lakukan pelunasan.`,
            type: "SETTLEMENT_DUE"
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: isFullyPaidNow
        ? "Mobil berhasil dikembalikan dan pembayaran lunas."
        : "Mobil dikembalikan. Menunggu pelunasan dari penyewa.",
      booking: updatedBooking,
      penaltyAmount,
      remainingAmount,
      finalTotal
    });

  } catch (error) {
    console.error("Return car error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pengembalian mobil" },
      { status: 500 }
    );
  }
}
