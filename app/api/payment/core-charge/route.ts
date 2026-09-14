import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  chargeMidtransCoreApi,
  isMidtransConfigured,
  CorePaymentMethod,
} from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bookingId,
      paymentMethod,
      paymentType = "DP",
    }: {
      bookingId: string;
      paymentMethod: CorePaymentMethod;
      paymentType?: "DP" | "FULL_PAYMENT";
    } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId wajib diisi" }, { status: 400 });
    }

    const validMethods: CorePaymentMethod[] = [
      "QRIS",
      "BCA_VA",
      "BNI_VA",
      "BRI_VA",
      "MANDIRI_BILL",
    ];

    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: `Metode ${paymentMethod} tidak didukung. Pilih QRIS, BCA_VA, BNI_VA, BRI_VA, atau MANDIRI_BILL.` },
        { status: 400 }
      );
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

    // Calculate Amount strictly on server
    let targetAmount = booking.dpAmount;
    let itemName = `DP Sewa ${booking.car.name}`;

    if (paymentType === "FULL_PAYMENT") {
      const verifiedPayments = await prisma.payment.findMany({
        where: { bookingId, status: "VERIFIED" },
      });
      const totalVerified = verifiedPayments.reduce((s, p) => s + p.amount, 0);
      const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
      targetAmount = Math.max(0, totalBill - totalVerified);
      itemName = `Pelunasan Sewa ${booking.car.name}`;
    }

    if (targetAmount <= 0) {
      return NextResponse.json(
        { error: "Tagihan ini sudah lunas, tidak memerlukan pembayaran lagi." },
        { status: 400 }
      );
    }

    if (!isMidtransConfigured()) {
      return NextResponse.json({
        success: false,
        isGatewayActive: false,
        message: "Payment Gateway Sandbox belum dikonfigurasi. Silakan tambahkan MIDTRANS_SERVER_KEY di server.",
      });
    }

    const uniqueOrderId = `RENTAL-${booking.id.slice(-6).toUpperCase()}-${paymentType}-${Date.now().toString().slice(-6)}`;
    const customerName = booking.user?.name || booking.guestName || "Pelanggan Rental";
    const customerEmail = booking.user?.email || booking.guestEmail || "customer@rentalmobil.com";
    const customerPhone = booking.user?.phone || booking.guestPhone || "08123456789";

    const chargeResult = await chargeMidtransCoreApi({
      bookingId: booking.id,
      orderId: uniqueOrderId,
      grossAmount: targetAmount,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      itemName,
      itemId: booking.carId,
    });

    if (!chargeResult.success) {
      return NextResponse.json({
        success: false,
        message: chargeResult.message || "Gagal membuat transaksi di Midtrans.",
      }, { status: 400 });
    }

    // Store in Payment model
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: targetAmount,
        type: paymentType,
        method: paymentMethod,
        bankName: chargeResult.bankName || (paymentMethod === "QRIS" ? "QRIS" : "BANK"),
        accountNumber: chargeResult.vaNumber || chargeResult.billKey || null,
        accountName: chargeResult.billerCode || null,
        proofImage: chargeResult.qrImageUrl || null,
        status: "PENDING",
        rejectReason: `ORDER_ID:${uniqueOrderId}|TX_ID:${chargeResult.transactionId || ""}|EXPIRY:${chargeResult.expiryTime || ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: uniqueOrderId,
      transactionId: chargeResult.transactionId,
      transactionStatus: chargeResult.transactionStatus,
      paymentMethod,
      amount: targetAmount,
      expiryTime: chargeResult.expiryTime,
      qrString: chargeResult.qrString,
      qrImageUrl: chargeResult.qrImageUrl,
      vaNumber: chargeResult.vaNumber,
      bankName: chargeResult.bankName,
      billerCode: chargeResult.billerCode,
      billKey: chargeResult.billKey,
    });
  } catch (error: any) {
    console.error("Core Charge API Error:", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
