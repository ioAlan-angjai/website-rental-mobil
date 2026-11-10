import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '12'));
    const skip = (page - 1) * limit;
    
    const category = searchParams.get('category');
    const transmission = searchParams.get('transmission');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'AVAILABLE';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

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

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseInt(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseInt(maxPrice);
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        select: {
          id: true,
          name: true,
          brand: true,
          category: true,
          year: true,
          transmission: true,
          fuelType: true,
          seats: true,
          pricePerDay: true,
          images: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: cars,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error("Get cars error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data mobil" },
      { status: 500 }
    );
  }
}
