import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ["PENDING", "WAITING_DP", "DP_CONFIRMED", "IN_PROGRESS"]
            }
          },
          select: {
            startDate: true,
            endDate: true,
          }
        }
      }
    });

    if (!car) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: car
    });

  } catch (error) {
    console.error("Get car detail error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil detail mobil" },
      { status: 500 }
    );
  }
}
