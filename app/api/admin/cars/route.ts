import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: cars,
    });
  } catch (error: any) {
    console.error("GET admin cars error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar armada" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, brand, type, capacity, transmission, fuelType, pricePerDay, image, status } = body;

    if (!name || !brand || !pricePerDay) {
      return NextResponse.json(
        { error: "Nama, Brand, dan Harga Per Hari wajib diisi" },
        { status: 400 }
      );
    }

    const newCar = await prisma.car.create({
      data: {
        name,
        brand,
        category: type || "SUV",
        seats: Number(capacity) || 5,
        transmission: transmission || "Automatic",
        fuelType: fuelType || "Bensin",
        year: 2024,
        pricePerDay: Number(pricePerDay),
        features: JSON.stringify(["AC", "Bluetooth", "USB", "Airbag"]),
        images: JSON.stringify([image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop"]),
        status: status || "AVAILABLE",
      },
    });

    return NextResponse.json(
      { success: true, message: "Mobil berhasil ditambahkan", data: newCar },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST admin car error:", error);
    return NextResponse.json(
      { error: "Gagal menambah data mobil" },
      { status: 500 }
    );
  }
}
