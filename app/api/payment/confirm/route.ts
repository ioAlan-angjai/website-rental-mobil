import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, paymentType = "DP", orderId, result } = body;

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

    const currentUserId = (session.user as any).id;
    const isUserAdmin = (session.user as any).role === "ADMIN";
    if (!isUserAdmin && booking.userId && booking.userId !== currentUserId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const paymentMethod = result?.payment_type ? result.payment_type.toUpperCase() : "MIDTRANS";

    if (paymentType === "DP") {
      // 1. Update or create verified payment record for DP
      const existingPayment = await prisma.payment.findFirst({
        where: {
          bookingId: booking.id,
          type: "DP",
        },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "VERIFIED",
            method: paymentMethod,
            amount: booking.dpAmount,
            verifiedAt: new Date(),
            verifiedBy: "MIDTRANS_AUTO",
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: booking.dpAmount,
            type: "DP",
            method: paymentMethod,
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: "MIDTRANS_AUTO",
          },
        });
      }

      // 2. Update booking status to DP_CONFIRMED
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "DP_CONFIRMED",
          dpPaid: true,
          paymentMethod: paymentMethod,
          paymentVerifiedAt: new Date(),
          paymentVerifiedBy: "MIDTRANS_AUTO",
        },
      });

      // 3. Send Notification to user
      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Pembayaran DP Berhasil Dikonfirmasi",
            message: `Pembayaran DP sebesar Rp ${booking.dpAmount.toLocaleString("id-ID")} untuk rental ${booking.car.name} telah berhasil diverifikasi oleh sistem.`,
            type: "PAYMENT_VERIFIED",
            link: `/riwayat-booking?id=${booking.id}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Pembayaran DP berhasil dikonfirmasi",
        booking: updatedBooking,
      });
    } else if (paymentType === "FULL_PAYMENT") {
      const verifiedPayments = await prisma.payment.findMany({
        where: { bookingId, status: "VERIFIED" },
      });
      const totalVerified = verifiedPayments.reduce((s, p) => s + p.amount, 0);
      const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
      const remainingAmount = Math.max(0, totalBill - totalVerified);

      // 1. Create or update payment record for Pelunasan
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: remainingAmount > 0 ? remainingAmount : totalBill,
          type: "FULL_PAYMENT",
          method: paymentMethod,
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: "MIDTRANS_AUTO",
        },
      });

      // 2. Update booking to COMPLETED and car to AVAILABLE
      const [updatedBooking] = await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "COMPLETED",
            fullPaid: true,
            remainingAmount: 0,
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: "MIDTRANS_AUTO",
          },
        }),
        prisma.car.update({
          where: { id: booking.carId },
          data: { status: "AVAILABLE" },
        }),
      ]);

      // 3. Send Notification to user
      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Pelunasan Diterima & Sewa Selesai",
            message: `Pelunasan sewa mobil ${booking.car.name} telah lunas sepenuhnya. Terima kasih atas kepercayaan Anda!`,
            type: "RENTAL_COMPLETED",
            link: `/riwayat-booking?id=${booking.id}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Pelunasan berhasil dikonfirmasi dan pesanan selesai",
        booking: updatedBooking,
      });
    }

    return NextResponse.json({ error: "Tipe pembayaran tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json({ error: "Gagal mengonfirmasi pembayaran" }, { status: 500 });
  }
}
