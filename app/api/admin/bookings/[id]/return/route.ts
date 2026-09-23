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
    const {
      actualReturnDate,
      paymentMethod = "CASH",
      manualPenaltyAmount,
      extraCost = 0,
      notes: returnNotes,
    } = body;

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

    if (booking.status !== "IN_PROGRESS" && booking.status !== "WAITING_RETURN") {
      return NextResponse.json(
        { error: "Mobil harus berstatus Sedang Berjalan (IN_PROGRESS) atau Menunggu Pengembalian (WAITING_RETURN) untuk dikembalikan" },
        { status: 400 }
      );
    }

    const returnTime = new Date(actualReturnDate);
    const endTime = new Date(booking.endDateTime);

    // Hitung estimasi denda Keterlambatan: 10% dari harga sewa 1 hari per jam
    let autoPenaltyAmount = 0;
    const diffTimeMs = returnTime.getTime() - endTime.getTime();

    if (diffTimeMs > 0) {
      const diffHours = Math.ceil(diffTimeMs / (1000 * 60 * 60));
      if (diffHours > 0) {
        const penaltyRatePerHour = 0.10; // 10% per jam
        autoPenaltyAmount = Math.round(diffHours * penaltyRatePerHour * booking.car.pricePerDay);
      }
    }

    // Gunakan nominal denda yang diinputkan admin jika ada, jika tidak gunakan estimasi otomatis
    const finalPenaltyAmount =
      manualPenaltyAmount !== undefined && manualPenaltyAmount !== null && manualPenaltyAmount !== ""
        ? Math.max(0, Math.round(Number(manualPenaltyAmount)))
        : autoPenaltyAmount;

    const finalExtraCost = Math.max(0, Math.round(Number(extraCost) || 0));

    // PENTING: booking.totalPrice adalah harga dasar sewa (basePrice - discountAmount) dan BERSIFAT TETAP.
    // Grand Total dihitung dinamis = totalPrice + penaltyAmount + extraCost
    const finalGrandTotal = booking.totalPrice + finalPenaltyAmount + finalExtraCost;

    // Hitung total pembayaran VERIFIED dari tabel Payment
    const verifiedPayments = await prisma.payment.findMany({
      where: { bookingId, status: "VERIFIED" },
    });
    const totalVerifiedPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = Math.max(0, finalGrandTotal - totalVerifiedPaid);

    const isFullyPaidNow = remainingAmount === 0;

    // Keterangan catatan denda / biaya tambahan
    const notesParts: string[] = [];
    if (returnNotes && returnNotes.trim()) {
      notesParts.push(returnNotes.trim());
    }
    if (finalPenaltyAmount > 0) {
      notesParts.push(`Denda keterlambatan: Rp ${finalPenaltyAmount.toLocaleString('id-ID')}`);
    }
    if (finalExtraCost > 0) {
      notesParts.push(`Biaya tambahan: Rp ${finalExtraCost.toLocaleString('id-ID')}`);
    }
    const combinedNotes = notesParts.length > 0 ? notesParts.join(' | ') : booking.notes;

    // Database transaction
    const [updatedBooking] = await prisma.$transaction([
      // 1. Update Booking: simpan penalty & extraCost, JANGAN ubah totalPrice dasar!
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          penaltyAmount: finalPenaltyAmount,
          extraCost: finalExtraCost,
          remainingAmount: remainingAmount,
          status: isFullyPaidNow ? "COMPLETED" : "WAITING_PAYMENT",
          fullPaid: isFullyPaidNow,
          notes: combinedNotes,
        }
      }),

      // 2. Set car status back to AVAILABLE
      prisma.car.update({
        where: { id: booking.carId },
        data: { status: "AVAILABLE" }
      }),

      // 3. Create payment record untuk pelunasan (+ denda + extra cost jika ada)
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
          rejectReason: (finalPenaltyAmount > 0 || finalExtraCost > 0) && !isFullyPaidNow
            ? notesParts.join(' | ')
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
        const extraText = [];
        if (finalPenaltyAmount > 0) extraText.push(`denda Rp ${finalPenaltyAmount.toLocaleString('id-ID')}`);
        if (finalExtraCost > 0) extraText.push(`biaya tambahan Rp ${finalExtraCost.toLocaleString('id-ID')}`);
        const extraString = extraText.length > 0 ? ` (termasuk ${extraText.join(', ')})` : '';

        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Tagihan Pelunasan Tersedia",
            message: `Mobil ${booking.car.name} telah dikembalikan. Sisa pembayaran pelunasan sebesar Rp ${remainingAmount.toLocaleString('id-ID')}${extraString}. Silakan lakukan pelunasan.`,
            type: "SETTLEMENT_DUE",
            link: `/pelunasan/${booking.id}`,
          } as any
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: isFullyPaidNow
        ? "Mobil berhasil dikembalikan dan pembayaran lunas."
        : "Mobil dikembalikan. Menunggu pelunasan dari penyewa.",
      booking: updatedBooking,
      penaltyAmount: finalPenaltyAmount,
      extraCost: finalExtraCost,
      remainingAmount,
      finalGrandTotal
    });

  } catch (error) {
    console.error("Return car error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pengembalian mobil" },
      { status: 500 }
    );
  }
}
