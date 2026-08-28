import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Ambil seluruh daftar sesi obrolan (chats) untuk Admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Hanya admin yang berhak mengakses." }, { status: 403 });
    }

    // Ambil seluruh chat yang pernah dibuat
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Tambahkan kalkulasi unread count per chat
    const formattedChats = chats.map((chat) => {
      const unreadCount = chat.messages.filter(
        (m) => !m.isRead && m.senderType === "USER"
      ).length;
      const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;

      return {
        ...chat,
        unreadCount,
        lastMessage,
      };
    });

    const totalUnread = formattedChats.reduce((acc, c) => acc + c.unreadCount, 0);

    return NextResponse.json({
      success: true,
      chats: formattedChats,
      totalUnread,
    });
  } catch (error) {
    console.error("Admin get chats error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar obrolan" }, { status: 500 });
  }
}
