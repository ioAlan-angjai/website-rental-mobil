import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId diperlukan" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            car: true,
            payments: true,
            user: { select: { name: true, email: true, phone: true, address: true, city: true, province: true } },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    // Cek akses
    const currentUserId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";
    if (!isAdmin && invoice.booking.userId && invoice.booking.userId !== currentUserId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error("Get invoice error:", error);
    return NextResponse.json({ error: "Gagal mengambil data invoice" }, { status: 500 });
  }
}
