import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        car: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Pemesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error("GET pelunasan detail error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tagihan pelunasan" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { paymentMethod, paymentProof, notes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        car: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Data pemesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hitung sisa tagihan
    const verifiedPaymentTotal = booking.payments
      ?.filter((p) => p.status === "VERIFIED")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const dpPaidAmount = verifiedPaymentTotal > 0
      ? verifiedPaymentTotal
      : (['DP_CONFIRMED', 'IN_PROGRESS', 'WAITING_PAYMENT', 'COMPLETED'].includes(booking.status) || booking.paymentProof)
      ? booking.dpAmount
      : 0;

    const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
    const remainingAmount = Math.max(0, totalBill - dpPaidAmount);

    // Update booking state
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        fullPaid: true,
        status: "COMPLETED",
        paymentMethod: paymentMethod || booking.paymentMethod,
        paymentProof: paymentProof || booking.paymentProof,
        notes: notes ? `${booking.notes || ''} | Pelunasan: ${notes}` : booking.notes,
      },
    });

    // Create payment record untuk pelunasan
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: remainingAmount > 0 ? remainingAmount : booking.totalPrice - booking.dpAmount,
        type: "FULL_PAYMENT",
        method: paymentMethod || "BCA_TRANSFER",
        status: "VERIFIED",
        proofImage: paymentProof || null,
        verifiedAt: new Date(),
        verifiedBy: session?.user?.email || "system",
      },
    });

    // Notifikasi ke user bahwa pelunasan sukses
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Pelunasan Berhasil & Sewa Selesai",
          message: `Terima kasih! Pelunasan sisa tagihan sebesar Rp ${(remainingAmount > 0 ? remainingAmount : booking.totalPrice - booking.dpAmount).toLocaleString('id-ID')} untuk unit ${booking.car.name} telah berhasil diproses.`,
          type: "RENTAL_COMPLETED",
        } as any,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pelunasan berhasil dikonfirmasi. Terima kasih!",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("POST pelunasan error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pelunasan pembayaran" },
      { status: 500 }
    );
  }
}
