import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: car });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal mengambil detail mobil" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, brand, type, capacity, transmission, fuelType, pricePerDay, image, status } = body;

    const existingCar = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedCar = await prisma.car.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(type !== undefined && { category: type }),
        ...(capacity !== undefined && { seats: Number(capacity) }),
        ...(transmission !== undefined && { transmission }),
        ...(fuelType !== undefined && { fuelType }),
        ...(pricePerDay !== undefined && { pricePerDay: Number(pricePerDay) }),
        ...(image !== undefined && { images: JSON.stringify([image]) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data mobil berhasil diperbarui",
      data: updatedCar,
    });
  } catch (error: any) {
    console.error("PATCH admin car error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data mobil" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.car.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Mobil berhasil dihapus dari sistem",
    });
  } catch (error: any) {
    console.error("DELETE admin car error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus mobil (mungkin masih terhubung ke data booking)" },
      { status: 500 }
    );
  }
}
