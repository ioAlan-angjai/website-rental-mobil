import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    // Extract data
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
    
    // Validasi tanggal
    if (start >= end) {
      return NextResponse.json(
        { error: "Tanggal mulai harus sebelum tanggal selesai" },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: "Tanggal mulai tidak boleh di masa lalu" },
        { status: 400 }
      );
    }

    // Hitung durasi (dalam hari)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Get car details
    const car = await prisma.car.findUnique({
      where: { id: carId }
    });

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

    // Cek ketersediaan mobil pada rentang tanggal tersebut
    const existingBookings = await prisma.booking.findMany({
      where: {
        carId,
        status: {
          in: ["PENDING", "WAITING_DP", "DP_CONFIRMED", "IN_PROGRESS"]
        },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Mobil sudah dipesan pada tanggal tersebut" },
        { status: 400 }
      );
    }

    // Calculate pricing
    const basePrice = car.pricePerDay * duration;
    const discountAmount = 0; // Bisa diimplementasikan nanti
    const dpAmount = Math.floor(basePrice * 0.5); // 50% DP
    const totalPrice = basePrice - discountAmount;

    // Prepare booking data
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
      paymentMethod: paymentMethod ? paymentMethod as string : null,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    };

    // Add userId jika user login
    if (session?.user && (session.user as any).id) {
      bookingData.user = { connect: { id: (session.user as any).id } };
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        car: true
      }
    });

    // Update car status
    await prisma.car.update({
      where: { id: carId },
      data: { status: "BOOKED" }
    });

    // Create initial payment record untuk DP
    if (paymentMethod) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: dpAmount,
          type: "DP",
          method: paymentMethod,
          status: "PENDING",
        }
      });
    }

    return NextResponse.json(
      {
        message: "Booking berhasil dibuat",
        booking,
        paymentRequired: true,
        dpAmount,
        bankAccounts: {
          BCA: { number: process.env.BANK_BCA_NUMBER, name: process.env.BANK_BCA_NAME },
          BNI: { number: process.env.BANK_BNI_NUMBER, name: process.env.BANK_BNI_NAME },
          MANDIRI: { number: process.env.BANK_MANDIRI_NUMBER, name: process.env.BANK_MANDIRI_NAME },
        }
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
