import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: bookingId } = params;
    
    const formData = await req.formData();
    const proofImage = formData.get('proofImage') as string;
    const paymentMethod = formData.get('paymentMethod') as string;

    // Validasi
    if (!proofImage) {
      return NextResponse.json(
        { error: "Bukti pembayaran harus diupload" },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods = ['QRIS', 'BCA_TRANSFER', 'BNI_TRANSFER', 'MANDIRI_TRANSFER'];
    if (paymentMethod && !validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Metode pembayaran tidak valid" },
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

    // Check ownership (jika user login)
    if (session?.user && (session.user as any).id && booking.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke booking ini" },
        { status: 403 }
      );
    }

    // Check status
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Booking sudah diproses atau dibatalkan" },
        { status: 400 }
      );
    }

    // Create or update payment record
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        type: "DP"
      }
    });

    if (existingPayment) {
      // Update existing payment
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          proofImage,
          method: paymentMethod as PaymentMethod,
          uploadedAt: new Date(),
          status: "PENDING"
        }
      });
    } else {
      // Create new payment
      await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.dpAmount,
          type: "DP",
          method: paymentMethod as PaymentMethod,
          proofImage,
          uploadedAt: new Date(),
          status: "PENDING"
        }
      });
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "WAITING_DP",
        paymentMethod: paymentMethod as PaymentMethod,
        paymentProof: proofImage
      }
    });

    // Create notification untuk admin
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" }
    });

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Bukti Pembayaran Baru",
          message: `Booking ${bookingId} telah mengupload bukti pembayaran DP`,
          type: "PAYMENT_RECEIVED"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.",
      booking: {
        ...booking,
        status: "WAITING_DP"
      }
    });

  } catch (error) {
    console.error("Payment upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupload bukti pembayaran" },
      { status: 500 }
    );
  }
}
