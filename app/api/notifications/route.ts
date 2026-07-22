import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: notifikasi milik user yang login
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

// POST: admin mengirim notifikasi (seperti pengingat pelunasan)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { bookingId, title, message, type } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    });

    if (booking?.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title,
          message,
          type,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST notification error:", error);
    return NextResponse.json({ error: "Gagal mengirim notifikasi" }, { status: 500 });
  }
}

// PATCH: tandai sudah dibaca
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    let body: { id?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body provided — treat as "mark all read"
    }
    const { id } = body;

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
    } else {
      // tandai semua
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification error:", error);
    return NextResponse.json({ error: "Gagal memproses notifikasi" }, { status: 500 });
  }
}
