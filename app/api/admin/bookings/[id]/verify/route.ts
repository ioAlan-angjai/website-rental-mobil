import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Cek role admin
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat memverifikasi pembayaran" },
        { status: 403 }
      );
    }

    const { id: bookingId } = params;
    const body = await req.json();
    const { action, rejectReason } = body; // action: "APPROVE" or "REJECT"

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action tidak valid. Gunakan APPROVE atau REJECT." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, car: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        bookingId,
        type: "DP"
      },
      orderBy: { createdAt: 'desc' }
    });

    if (action === "APPROVE") {
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.user?.email || "admin"
          }
        });
      } else {
        await prisma.payment.create({
          data: {
            bookingId,
            amount: booking.dpAmount,
            type: "DP",
            method: booking.paymentMethod || "MANUAL",
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.user?.email || "admin"
          }
        });
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "DP_CONFIRMED",
          dpPaid: true,
          paymentVerifiedAt: new Date(),
          paymentVerifiedBy: session.user?.email || "admin"
        }
      });

      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Pembayaran DP Diterima",
            message: `Pembayaran DP untuk booking mobil ${booking.car.name} telah dikonfirmasi oleh admin.`,
            type: "PAYMENT_VERIFIED"
          }
        });
      }
    } else {
      // REJECT
      if (!rejectReason) {
        return NextResponse.json(
          { error: "Alasan penolakan harus diisi" },
          { status: 400 }
        );
      }

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "REJECTED",
            rejectReason
          }
        });
      } else {
        await prisma.payment.create({
          data: {
            bookingId,
            amount: booking.dpAmount,
            type: "DP",
            method: booking.paymentMethod || "MANUAL",
            status: "REJECTED",
            rejectReason
          }
        });
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "REJECTED",
          notes: rejectReason
        }
      });

      // Set car back to AVAILABLE
      await prisma.car.update({
        where: { id: booking.carId },
        data: { status: "AVAILABLE" }
      });

      // Buat notifikasi untuk user
      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Pembayaran DP Ditolak",
            message: `Pembayaran DP ditolak dengan alasan: ${rejectReason}. Silakan upload bukti pembayaran baru.`,
            type: "BOOKING_REJECTED"
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan ${action} pada pembayaran.`
    });

  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses verifikasi" },
      { status: 500 }
    );
  }
}
