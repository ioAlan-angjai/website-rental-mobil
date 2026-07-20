import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { updateInProgressBookings } from "@/lib/booking-utils";

// GET: Ambil semua booking milik user yang sedang login
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto update bookings to IN_PROGRESS if pickup time has reached/passed
    await updateInProgressBookings();

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
          select: { id: true, amount: true, type: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data booking" },
      { status: 500 }
    );
  }
}

// POST: Buat booking baru
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    } = body;

    // Validasi input
    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Data mobil, tanggal mulai, dan tanggal selesai harus diisi" },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "Waktu pengembalian harus setelah waktu pengambilan" },
        { status: 400 }
      );
    }

    // Hitung durasi dalam menit (presisi, mendukung booking beberapa jam / 1 hari / beberapa hari)
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const durationHours = durationMinutes / 60;

    // Get car details dari database
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    if (car.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Mobil sedang tidak tersedia untuk disewa" },
        { status: 400 }
      );
    }

    // Cek ketersediaan: overlap interval [start, end) dengan booking aktif
    const existingBookings = await prisma.booking.findMany({
      where: {
        carId,
        status: { in: ["PENDING", "WAITING_DP", "DP_CONFIRMED", "IN_PROGRESS"] },
        // Konflik jika existing.start < requested.end AND existing.end > requested.start
        startDateTime: { lt: end },
        endDateTime: { gt: start },
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Mobil sudah dipesan pada waktu tersebut. Silakan pilih waktu lain." },
        { status: 400 }
      );
    }

    // Ambil tarif driver harian dari database Setting (default 150.000 jika belum di-set)
    let driverFeePerDay = 0;
    if (serviceType === "DENGAN_DRIVER") {
      const driverSetting = await prisma.setting.findUnique({
        where: { key: "DRIVER_FEE_PER_DAY" },
      });
      driverFeePerDay = driverSetting ? parseInt(driverSetting.value, 10) : 150000;
    }

    // Perhitungan sewa dihitung per hari (24 jam atau kurang terhitung 1 hari)
    const diffMs = end.getTime() - start.getTime();
    const rentalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dailyRate = car.pricePerDay + driverFeePerDay;
    const basePrice = rentalDays * dailyRate;
    const discountAmount = 0;
    const dpAmount = Math.floor(basePrice * 0.5);
    const totalPrice = basePrice - discountAmount;

    // Siapkan data booking
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
    };

    // Hubungkan ke user jika sedang login (deteksi ID atau via Email)
    let userIdToConnect = (session?.user as any)?.id;
    if (!userIdToConnect && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) userIdToConnect = dbUser.id;
    }

    if (userIdToConnect) {
      bookingData.user = { connect: { id: userIdToConnect } };
    }

    // Buat booking
    const booking = await prisma.booking.create({
      data: bookingData,
      include: { car: true, user: { select: { name: true, email: true } } },
    });

    // Buat payment record untuk DP jika ada paymentMethod
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

    // Notifikasi ke ADMIN: booking baru masuk (safely wrapped)
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

      // Notifikasi ke USER: booking berhasil dibuat
      if (booking.userId) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: "Booking Berhasil Dibuat",
            message: `Booking mobil ${booking.car.name} berhasil dibuat. Silakan lakukan pembayaran DP sebesar Rp ${dpAmount.toLocaleString("id-ID")}.`,
            type: "BOOKING_CREATED",
          },
        });
      }
    } catch (notifErr) {
      console.error("Non-fatal notification creation error:", notifErr);
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
    console.error("Booking error details:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat membuat booking" },
      { status: 500 }
    );
  }
}
