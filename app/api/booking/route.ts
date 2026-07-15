import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Ambil semua booking milik user yang sedang login
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (start >= end) {
      return NextResponse.json(
        { error: "Tanggal mulai harus sebelum tanggal selesai" },
        { status: 400 }
      );
    }

    // Hitung durasi (dalam hari)
    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

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

    // Cek ketersediaan pada rentang tanggal
    const existingBookings = await prisma.booking.findMany({
      where: {
        carId,
        status: { in: ["PENDING", "WAITING_DP", "DP_CONFIRMED", "IN_PROGRESS"] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Mobil sudah dipesan pada tanggal tersebut" },
        { status: 400 }
      );
    }

    // Hitung harga
    const basePrice = car.pricePerDay * duration;
    const discountAmount = 0;
    const dpAmount = Math.floor(basePrice * 0.5);
    const totalPrice = basePrice - discountAmount;

    // Siapkan data booking
    const bookingData: any = {
      car: { connect: { id: carId } },
      startDate: start,
      endDate: end,
      duration,
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

    // Hubungkan ke user jika sedang login
    if (session?.user && (session.user as any).id) {
      bookingData.user = { connect: { id: (session.user as any).id } };
    }

    // Buat booking
    const booking = await prisma.booking.create({
      data: bookingData,
      include: { car: true },
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
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat booking" },
      { status: 500 }
    );
  }
}
