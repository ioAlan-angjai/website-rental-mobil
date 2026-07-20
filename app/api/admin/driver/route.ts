import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "DRIVER_FEE_PER_DAY" },
    });

    const driverFee = setting ? parseInt(setting.value, 10) : 150000;

    return NextResponse.json({
      success: true,
      driverFeePerDay: driverFee,
    });
  } catch (error: any) {
    console.error("GET driver setting error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tarif driver" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { driverFeePerDay } = body;

    if (typeof driverFeePerDay !== "number" || driverFeePerDay < 0) {
      return NextResponse.json(
        { error: "Tarif driver harus berupa angka positif" },
        { status: 400 }
      );
    }

    const updatedSetting = await prisma.setting.upsert({
      where: { key: "DRIVER_FEE_PER_DAY" },
      update: { value: driverFeePerDay.toString() },
      create: { key: "DRIVER_FEE_PER_DAY", value: driverFeePerDay.toString() },
    });

    return NextResponse.json({
      success: true,
      message: "Tarif driver berhasil diperbarui",
      driverFeePerDay: parseInt(updatedSetting.value, 10),
    });
  } catch (error: any) {
    console.error("PUT driver setting error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui tarif driver" },
      { status: 500 }
    );
  }
}
