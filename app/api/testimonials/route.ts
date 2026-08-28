import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error("GET testimonials error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data testimoni" },
      { status: 500 }
    );
  }
}
