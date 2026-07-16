import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { updateInProgressBookings } from "@/lib/booking-utils";

export const dynamic = 'force-dynamic';

// GET: Ambil semua booking untuk dashboard admin
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto update bookings to IN_PROGRESS if pickup time has reached/passed
    await updateInProgressBookings();

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        car: {
          select: {
            id: true,
            name: true,
            brand: true,
            pricePerDay: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            type: true,
            status: true,
            method: true,
            proofImage: true,
            uploadedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get admin bookings error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data booking" },
      { status: 500 }
    );
  }
}
