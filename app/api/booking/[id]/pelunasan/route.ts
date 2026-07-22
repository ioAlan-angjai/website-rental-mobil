import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Wajib login
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

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

    // Cek ownership: hanya pemilik booking atau admin yang bisa akses
    const currentUserId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isAdmin && booking.userId && booking.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke pemesanan ini" },
        { status: 403 }
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

    // Wajib login
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

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

    // Cek ownership: hanya pemilik booking atau admin yang bisa akses
    const currentUserId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isAdmin && booking.userId && booking.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke pemesanan ini" },
        { status: 403 }
      );
    }

    // Hitung jumlah total pembayaran VERIFIED dari tabel Payment (SUM, bukan asumsi DP tunggal)
    const verifiedPayments = await prisma.payment.findMany({
      where: {
        bookingId: booking.id,
        status: "VERIFIED",
      },
    });

    const verifiedPaymentTotal = verifiedPayments.reduce(
      (sum: number, p: any) => sum + p.amount,
      0
    );

    const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
    const remainingAmount = Math.max(0, totalBill - verifiedPaymentTotal);

    // Validasi: pastikan ada sisa yang harus dibayar
    if (remainingAmount <= 0) {
      return NextResponse.json(
        { error: "Tidak ada tagihan yang perlu dilunasi. Seluruh pembayaran sudah lunas." },
        { status: 400 }
      );
    }

    // Update booking state: menunggu verifikasi pelunasan dari admin
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: "WAITING_PAYMENT",
        paymentMethod: paymentMethod || booking.paymentMethod,
        paymentProof: paymentProof || booking.paymentProof,
        notes: notes ? `${booking.notes || ''} | Pelunasan: ${notes}` : booking.notes,
      },
    });

    // Create payment record untuk pelunasan (PENDING — menunggu verifikasi admin)
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: remainingAmount,
        type: "FULL_PAYMENT",
        method: paymentMethod || "BCA_TRANSFER",
        status: "PENDING",
        proofImage: paymentProof || null,
      },
    });

    // Notifikasi admin bahwa user mengirim bukti pelunasan
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Bukti Pelunasan Masuk",
          message: `Booking ${booking.id} — ${booking.car?.name || ''}. Sisa tagihan Rp ${remainingAmount.toLocaleString('id-ID')} menunggu verifikasi.`,
          type: "PAYMENT_RECEIVED",
        } as any,
      });
    }

    // Notifikasi ke user bahwa bukti pelunasan diterima
    if (booking.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "Bukti Pelunasan Diterima Sistem",
          message: `Bukti pembayaran pelunasan Anda untuk ${booking.car?.name || 'mobil'} telah kami terima. Menunggu verifikasi admin.`,
          type: "PAYMENT_RECEIVED",
        } as any,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Bukti pelunasan berhasil dikirim. Menunggu verifikasi admin.",
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
