import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { updateInProgressBookings } from "@/lib/booking-utils";
import { saveBase64Image } from "@/lib/upload";
import { ApiResponseBuilder } from "@/lib/api-response";
import { logError, createApiError } from "@/lib/error-handler";

// GET: Ambil semua booking milik user yang sedang login
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return ApiResponseBuilder.unauthorized('Silakan login terlebih dahulu untuk melihat riwayat booking');
    }

    updateInProgressBookings().catch((err) =>
      logError(createApiError('INTERNAL_ERROR', 'Background update failed'), 'Background updateInProgressBookings')
    );

    const userId = (session.user as any).id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        car: {
          select: {
            id: true,
            name: true,
            brand: true,
            category: true,
            images: true,
            pricePerDay: true,
          },
        },
        payments: {
          select: { id: true, amount: true, type: true, status: true, method: true, proofImage: true, uploadedAt: true },
        },
      },
    });

    const mappedBookings = bookings.map((b) => {
      const proofPayment = b.payments?.find(
        (p: any) => p.proofImage && !p.proofImage.includes("midtrans.com")
      );
      return {
        ...b,
        paymentProof: proofPayment?.proofImage || null,
      };
    });

    return ApiResponseBuilder.success(mappedBookings);
  } catch (error) {
    logError(createApiError('DATABASE_ERROR'), 'GET /api/booking');
    return ApiResponseBuilder.databaseError(error);
  }
}

// POST: Buat booking baru
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return ApiResponseBuilder.unauthorized('Anda harus login terlebih dahulu untuk melakukan reservasi mobil');
    }

    const body = await req.json();

    const {
      carId,
      startDate,
      endDate,
      serviceType = "LEPAS_KUNCI",
      pickupLocation,
      returnLocation,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      paymentMethod,
      ktpBookingImage,
      simBookingImage,
    } = body;

    if (!carId || !startDate || !endDate) {
      return ApiResponseBuilder.validationError(
        'Data mobil, tanggal mulai, dan tanggal selesai harus diisi',
        { carId: !carId ? 'Mobil harus dipilih' : '', startDate: !startDate ? 'Tanggal mulai harus diisi' : '', endDate: !endDate ? 'Tanggal selesai harus diisi' : '' }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return ApiResponseBuilder.validationError('Format tanggal tidak valid. Gunakan format ISO 8601');
    }

    if (start >= end) {
      return ApiResponseBuilder.validationError('Waktu pengembalian harus setelah waktu pengambilan');
    }

    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const durationHours = durationMinutes / 60;

    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
      return ApiResponseBuilder.notFound('Mobil');
    }

    if (car.status !== "AVAILABLE") {
      return ApiResponseBuilder.error('CONFLICT', 'Mobil sedang tidak tersedia untuk disewa. Silakan pilih mobil lain atau waktu lain');
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        carId,
        status: { in: ["PENDING", "WAITING_DP", "DP_CONFIRMED", "IN_PROGRESS", "WAITING_RETURN"] },
        startDateTime: { lt: end },
        endDateTime: { gt: start },
      },
    });

    if (existingBookings.length > 0) {
      return ApiResponseBuilder.error('CONFLICT', 'Mobil sudah dipesan pada waktu tersebut. Silakan pilih waktu lain');
    }

    let driverFeePerDay = 0;
    if (serviceType === "DENGAN_DRIVER") {
      try {
        const driverSetting = await prisma.setting.findUnique({
          where: { key: "DRIVER_FEE_PER_DAY" },
        });
        driverFeePerDay = driverSetting ? parseInt(driverSetting.value, 10) : 150000;
      } catch (err) {
        logError(createApiError('DATABASE_ERROR', 'Failed to fetch driver fee'), 'Booking - Driver Fee');
        driverFeePerDay = 150000;
      }
    }

    const diffMs = end.getTime() - start.getTime();
    const rentalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dailyRate = car.pricePerDay + driverFeePerDay;
    const basePrice = rentalDays * dailyRate;
    const discountAmount = 0;
    const dpAmount = Math.floor(basePrice * 0.5);
    const totalPrice = basePrice - discountAmount;

    const bookingData: any = {
      car: { connect: { id: carId } },
      startDateTime: start,
      endDateTime: end,
      durationMinutes: durationMinutes,
      serviceType: serviceType as string,
      pickupLocation,
      returnLocation,
      basePrice,
      discountAmount,
      totalPrice,
      dpAmount,
      dpPaid: false,
      fullPaid: false,
      status: "PENDING",
      paymentMethod: paymentMethod ? (paymentMethod as string) : null,
      notes,
      guestName,
      guestEmail,
      guestPhone,
      ktpBookingImage: await saveBase64Image(ktpBookingImage, "documents"),
      simBookingImage: await saveBase64Image(simBookingImage, "documents"),
    };

    let userIdToConnect = (session?.user as any)?.id;
    if (!userIdToConnect && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) userIdToConnect = dbUser.id;
    }

    if (!userIdToConnect) {
      return ApiResponseBuilder.unauthorized('Akun pengguna tidak ditemukan. Silakan login ulang');
    }

    bookingData.user = { connect: { id: userIdToConnect } };

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: bookingData,
        include: { car: true, user: { select: { name: true, email: true } } },
      }),
      prisma.car.update({
        where: { id: carId },
        data: { status: "BOOKED" },
      }),
    ]);

    if (paymentMethod) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: dpAmount,
          type: "DP",
          method: paymentMethod,
          status: "PENDING",
        },
      });
    }

    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        const renterName = booking.user?.name || guestName || "Guest";
        const durasiTeks = durationHours >= 24
          ? `${Math.floor(durationHours / 24)} hari ${durationHours % 24 ? `${Math.round(durationHours % 24)} jam` : ""}`.trim()
          : `${durationHours} jam`;
        
        for (const admin of adminUsers) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: "Booking Baru Masuk",
              message: `${renterName} memesan ${booking.car.name} (${durasiTeks}). Status: menunggu pembayaran DP.`,
              type: "BOOKING_CREATED_ADMIN",
            },
          });
        }
      }

      if (booking.userId) {
        const isGateway = booking.paymentMethod === "MIDTRANS";
        const messageText = isGateway
          ? `Booking mobil ${booking.car.name} berhasil dibuat. Silakan selesaikan pembayaran DP sebesar Rp ${dpAmount.toLocaleString("id-ID")} melalui Midtrans Payment Gateway untuk mengonfirmasi pesanan.`
          : `Booking mobil ${booking.car.name} berhasil dibuat. Silakan transfer DP sebesar Rp ${dpAmount.toLocaleString("id-ID")} dan unggah bukti transfer.`;

        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Booking Berhasil Dibuat",
            message: messageText,
            type: "BOOKING_CREATED",
          },
        });
      }
    } catch (notifErr) {
      logError(createApiError('INTERNAL_ERROR', 'Notification creation failed'), 'Booking - Notifications');
    }

    return NextResponse.json(
      {
        message: "Booking berhasil dibuat",
        booking,
        paymentRequired: true,
        dpAmount,
        bankAccounts: {
          BCA: {
            number: process.env.BANK_BCA_NUMBER,
            name: process.env.BANK_BCA_NAME,
          },
          BNI: {
            number: process.env.BANK_BNI_NUMBER,
            name: process.env.BANK_BNI_NAME,
          },
          MANDIRI: {
            number: process.env.BANK_MANDIRI_NUMBER,
            name: process.env.BANK_MANDIRI_NAME,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(createApiError('BOOKING_ERROR', error?.message), 'POST /api/booking');
    
    if (error?.code === 'P2002') {
      return ApiResponseBuilder.error('CONFLICT', 'Booking dengan data yang sama sudah ada');
    }
    
    if (error?.code?.startsWith('P')) {
      return ApiResponseBuilder.databaseError(error);
    }
    
    return ApiResponseBuilder.internalError(error, 'Booking Creation');
  }
}
