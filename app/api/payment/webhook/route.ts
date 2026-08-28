import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/payment-gateway";

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentMethod = notification.payment_type || "MIDTRANS";

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // Signature verification
    if (serverKey && !serverKey.startsWith("mock-")) {
      const isValid = verifyMidtransSignature(
        orderId,
        statusCode,
        grossAmount,
        serverKey,
        signatureKey
      );

      if (!isValid) {
        console.error("Invalid Midtrans signature for order:", orderId);
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    // Find the payment record matching this order ID
    const payment = await prisma.payment.findFirst({
      where: {
        rejectReason: { contains: `ORDER_ID:${orderId}` },
      },
      include: {
        booking: {
          include: { car: true, user: true },
        },
      },
    });

    if (!payment) {
      console.warn("No payment record found matching orderId:", orderId);
      return NextResponse.json({ message: "Payment record not found, ignored" });
    }

    const booking = payment.booking;
    const isSuccess =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");
    const isFailure =
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire";

    if (isSuccess) {
      // 1. Mark payment as VERIFIED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "VERIFIED",
          method: paymentMethod.toUpperCase(),
          verifiedAt: new Date(),
          verifiedBy: "MIDTRANS_AUTO",
          rejectReason: null,
        },
      });

      if (payment.type === "DP") {
        // Auto confirm DP
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "DP_CONFIRMED",
            dpPaid: true,
            paymentMethod: paymentMethod.toUpperCase(),
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: "MIDTRANS_AUTO",
          },
        });

        if (booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Pembayaran DP Berhasil Dikonfirmasi",
              message: `Pembayaran DP untuk sewa mobil ${booking.car.name} telah berhasil diverifikasi otomatis oleh sistem.`,
              type: "PAYMENT_VERIFIED",
              link: `/riwayat-booking?id=${booking.id}`,
            },
          });
        }
      } else if (payment.type === "FULL_PAYMENT") {
        // Auto complete rental
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: "COMPLETED",
              fullPaid: true,
              paymentVerifiedAt: new Date(),
              paymentVerifiedBy: "MIDTRANS_AUTO",
            },
          }),
          prisma.car.update({
            where: { id: booking.carId },
            data: { status: "AVAILABLE" },
          }),
        ]);

        if (booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Pelunasan Diterima & Sewa Selesai",
              message: `Pelunasan sewa mobil ${booking.car.name} telah lunas. Terima kasih telah mempercayai kami!`,
              type: "RENTAL_COMPLETED",
              link: `/riwayat-booking?id=${booking.id}`,
            },
          });
        }
      }
    } else if (isFailure) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "REJECTED",
          rejectReason: `Transaksi gagal: ${transactionStatus}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
