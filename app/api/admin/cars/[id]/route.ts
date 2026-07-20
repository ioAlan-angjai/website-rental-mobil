import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, brand, type, capacity, transmission, fuelType, pricePerDay, image, images, status } = body;

    const existingCar = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: "Mobil tidak ditemukan" },
        { status: 404 }
      );
    }

    // Handle images: jika ada array, stringify; jika ada image tunggal; fallback biarkan apa adanya
    let imagesData: string | undefined;
    if (images !== undefined) {
      imagesData = typeof images === 'string' ? images : JSON.stringify(images);
    } else if (image !== undefined) {
      imagesData = JSON.stringify([image]);
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
        ...(imagesData !== undefined && { images: imagesData }),
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
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
