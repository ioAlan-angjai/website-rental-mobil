import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get query parameters
    const category = searchParams.get('category');
    const transmission = searchParams.get('transmission');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'AVAILABLE';

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (transmission && transmission !== 'all') {
      where.transmission = transmission;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get cars with filters
    const cars = await prisma.car.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: cars,
      total: cars.length
    });

  } catch (error) {
    console.error("Get cars error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data mobil" },
      { status: 500 }
    );
  }
}
