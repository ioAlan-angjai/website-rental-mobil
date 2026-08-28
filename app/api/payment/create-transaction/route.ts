import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMidtransTransaction, isMidtransConfigured } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, paymentType = "DP" } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId wajib diisi" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true, user: true, payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    // Ownership check
    const currentUserId = (session.user as any).id;
    const isUserAdmin = (session.user as any).role === "ADMIN";
    if (!isUserAdmin && booking.userId && booking.userId !== currentUserId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    // Determine amount
    let targetAmount = booking.dpAmount;
    let itemName = `DP Sewa Mobil ${booking.car.name}`;

    if (paymentType === "FULL_PAYMENT") {
      const verifiedPayments = await prisma.payment.findMany({
        where: { bookingId, status: "VERIFIED" },
      });
      const totalVerified = verifiedPayments.reduce((s, p) => s + p.amount, 0);
      const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
      targetAmount = Math.max(0, totalBill - totalVerified);
      itemName = `Pelunasan Sewa Mobil ${booking.car.name}`;
    }

    if (targetAmount <= 0) {
      return NextResponse.json(
        { error: "Tagihan ini sudah lunas, tidak memerlukan pembayaran lagi." },
        { status: 400 }
      );
    }

    // Order ID format: BOOKINGID-TYPE-TIMESTAMP
    const uniqueOrderId = `RENTAL-${booking.id.slice(-6).toUpperCase()}-${paymentType}-${Date.now().toString().slice(-6)}`;

    // If Midtrans is not configured, inform the client to use manual transfer
    if (!isMidtransConfigured()) {
      return NextResponse.json({
        success: false,
        isGatewayActive: false,
        message: "Payment Gateway otomatis belum aktif. Silakan lakukan transfer manual ke rekening bank kami.",
        amount: targetAmount,
        orderId: uniqueOrderId,
      });
    }

    const customerName = booking.user?.name || booking.guestName || "Pelanggan Rental";
    const customerEmail = booking.user?.email || booking.guestEmail || "customer@rentalmobil.com";
    const customerPhone = booking.user?.phone || booking.guestPhone || "08123456789";

    const gatewayResult = await createMidtransTransaction({
      bookingId: booking.id,
      orderId: uniqueOrderId,
      grossAmount: targetAmount,
      customerName,
      customerEmail,
      customerPhone,
      itemDetails: [
        {
          id: booking.carId,
          price: targetAmount,
          quantity: 1,
          name: itemName,
        },
      ],
    });

    if (!gatewayResult.isGatewayActive || !gatewayResult.token) {
      return NextResponse.json({
        success: false,
        isGatewayActive: false,
        message: gatewayResult.message || "Gagal membuat transaksi di gateway pembayaran.",
      });
    }

    // Create or update pending payment record with order ID
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: targetAmount,
        type: paymentType,
        method: "MIDTRANS",
        status: "PENDING",
        rejectReason: `ORDER_ID:${uniqueOrderId}`,
      },
    });

    return NextResponse.json({
      success: true,
      isGatewayActive: true,
      token: gatewayResult.token,
      redirectUrl: gatewayResult.redirectUrl,
      orderId: uniqueOrderId,
      amount: targetAmount,
    });
  } catch (error) {
    console.error("Create payment transaction error:", error);
    return NextResponse.json({ error: "Gagal membuat sesi pembayaran" }, { status: 500 });
  }
}
