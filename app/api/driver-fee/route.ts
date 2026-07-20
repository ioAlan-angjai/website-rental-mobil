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
    return NextResponse.json({
      success: true,
      driverFeePerDay: 150000,
    });
  }
}
