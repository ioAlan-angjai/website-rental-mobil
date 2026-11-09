import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { saveBase64Image } from "@/lib/upload";
import { ApiResponseBuilder } from "@/lib/api-response";
import { logError, createApiError } from "@/lib/error-handler";

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

    if (!proofImage) {
      return ApiResponseBuilder.validationError('Bukti pembayaran harus diupload', { proofImage: 'File bukti transfer harus dipilih' });
    }

    const savedProofUrl = await saveBase64Image(proofImage, "payments");

    const validMethods = ['QRIS', 'BCA_TRANSFER', 'BNI_TRANSFER', 'MANDIRI_TRANSFER'];
    if (paymentMethod && !validMethods.includes(paymentMethod)) {
      return ApiResponseBuilder.validationError(
        'Metode pembayaran tidak valid',
        { paymentMethod: `Harus salah satu dari: ${validMethods.join(', ')}` }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true }
    });

    if (!booking) {
      return ApiResponseBuilder.notFound('Booking');
    }

    let currentUserId = (session?.user as any)?.id;
    if (!currentUserId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
      });
      if (dbUser) currentUserId = dbUser.id;
    }

    const isUserAdmin = (session?.user as any)?.role === "ADMIN";

    if (
      session?.user &&
      !isUserAdmin &&
      booking.userId &&
      currentUserId &&
      booking.userId !== currentUserId
    ) {
      return ApiResponseBuilder.forbidden('Anda tidak memiliki akses ke booking ini');
    }

    if (booking.status !== "PENDING" && booking.status !== "WAITING_DP") {
      return ApiResponseBuilder.error(
        'CONFLICT',
        'Booking sudah diproses atau dibatalkan. Upload bukti pembayaran tidak dapat dilakukan',
        { status: booking.status }
      );
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId,
        type: "DP"
      }
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          proofImage: savedProofUrl,
          method: paymentMethod,
          uploadedAt: new Date(),
          status: "PENDING"
        }
      });
    } else {
      await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.dpAmount,
          type: "DP",
          method: paymentMethod,
          proofImage: savedProofUrl,
          uploadedAt: new Date(),
          status: "PENDING"
        }
      });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "WAITING_DP",
        paymentMethod: paymentMethod,
      }
    });

    try {
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
    } catch (notifErr) {
      logError(createApiError('INTERNAL_ERROR', 'Notification creation failed'), 'Payment - Notification');
    }

    return ApiResponseBuilder.success({
      message: "Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.",
      booking: {
        ...booking,
        status: "WAITING_DP"
      }
    });

  } catch (error) {
    logError(createApiError('PAYMENT_ERROR'), 'POST /api/booking/[id]/payment');
    
    if (error instanceof Error && error.message.includes('Prisma')) {
      return ApiResponseBuilder.databaseError(error);
    }
    
    return ApiResponseBuilder.error('PAYMENT_ERROR', 'Terjadi kesalahan saat mengupload bukti pembayaran', undefined, 'Payment Upload');
  }
}
