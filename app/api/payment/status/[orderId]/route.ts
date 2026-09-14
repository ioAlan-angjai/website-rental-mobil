import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getMidtransTransactionStatus } from "@/lib/payment-gateway";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib diisi" }, { status: 400 });
    }

    // Find the payment in DB
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
      return NextResponse.json({ error: "Transaksi tidak ditemukan di database" }, { status: 404 });
    }

    const booking = payment.booking;

    // Check with Midtrans Sandbox API
    const midtransStatus = await getMidtransTransactionStatus(orderId);

    const transactionStatus = midtransStatus.transactionStatus;
    const fraudStatus = midtransStatus.fraudStatus;

    const isSuccess =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");
    const isFailure =
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire";

    if (isSuccess && payment.status !== "VERIFIED") {
      // 1. Mark payment as VERIFIED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: "MIDTRANS_CORE_POLL",
        },
      });

      if (payment.type === "DP") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "DP_CONFIRMED",
            dpPaid: true,
            paymentMethod: payment.method,
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: "MIDTRANS_CORE_POLL",
          },
        });

        if (booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Pembayaran DP Berhasil Dikonfirmasi",
              message: `Pembayaran DP sebesar Rp ${booking.dpAmount.toLocaleString("id-ID")} untuk ${booking.car.name} telah terverifikasi sukses.`,
              type: "PAYMENT_VERIFIED",
              link: `/riwayat-booking?id=${booking.id}`,
            },
          });
        }
      } else if (payment.type === "FULL_PAYMENT") {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: "COMPLETED",
              fullPaid: true,
              remainingAmount: 0,
              paymentVerifiedAt: new Date(),
              paymentVerifiedBy: "MIDTRANS_CORE_POLL",
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
    } else if (isFailure && payment.status === "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "REJECTED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      transactionStatus: transactionStatus || (payment.status === "VERIFIED" ? "settlement" : "pending"),
      paymentStatus: isSuccess ? "VERIFIED" : (isFailure ? "REJECTED" : payment.status),
      isPaid: isSuccess || payment.status === "VERIFIED",
      bookingStatus: isSuccess ? (payment.type === "DP" ? "DP_CONFIRMED" : "COMPLETED") : booking.status,
    });
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return NextResponse.json({ error: "Gagal memeriksa status pembayaran" }, { status: 500 });
  }
}
