import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateDriverExperienceYears } from "@/lib/driver";

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
    });

    const driversWithExperience = drivers.map((driver) => {
      const expYears = calculateDriverExperienceYears(driver.initialExperience, driver.createdAt);
      return {
        ...driver,
        experienceYears: expYears,
        experience: `${expYears} Tahun`,
      };
    });

    return NextResponse.json({
      success: true,
      data: driversWithExperience,
    });
  } catch (error: any) {
    console.error("GET drivers error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data driver" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, address, initialExperience } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama driver wajib diisi" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Nomor handphone driver wajib diisi" },
        { status: 400 }
      );
    }

    const expNum = parseInt(initialExperience, 10);
    const validExp = isNaN(expNum) || expNum < 0 ? 0 : expNum;

    const newDriver = await prisma.driver.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
        initialExperience: validExp,
        status: "READY",
        rating: 5.0,
      },
    });

    const expYears = calculateDriverExperienceYears(newDriver.initialExperience, newDriver.createdAt);

    return NextResponse.json({
      success: true,
      message: "Driver baru berhasil ditambahkan",
      data: {
        ...newDriver,
        experienceYears: expYears,
        experience: `${expYears} Tahun`,
      },
    });
  } catch (error: any) {
    console.error("POST driver error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan driver baru" },
      { status: 500 }
    );
  }
}
