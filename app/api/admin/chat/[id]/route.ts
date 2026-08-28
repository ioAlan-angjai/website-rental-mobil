import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Ambil detail chat tertentu dan tandai pesan USER sebagai telah dibaca
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const chatId = params.id;
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
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

    if (!chat) {
      return NextResponse.json({ error: "Sesi chat tidak ditemukan" }, { status: 404 });
    }

    // Tandai semua pesan dari USER sebagai dibaca
    await prisma.chatMessage.updateMany({
      where: {
        chatId: chat.id,
        senderType: "USER",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Admin get chat detail error:", error);
    return NextResponse.json({ error: "Gagal memuat percakapan" }, { status: 500 });
  }
}

// POST: Admin membalas pesan ke pengguna
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const adminUserId = (session.user as any).id;
    const chatId = params.id;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Pesan balasan tidak boleh kosong" }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: "Sesi chat tidak ditemukan" }, { status: 404 });
    }

    // Buat pesan balasan dari ADMIN
    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: adminUserId,
        senderType: "ADMIN",
        message: message.trim(),
        isRead: true,
      },
    });

    // Update status chat
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
        handledBy: "ADMIN",
        assignedToId: adminUserId,
        assignedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Admin reply chat error:", error);
    return NextResponse.json({ error: "Gagal mengirim balasan pesan" }, { status: 500 });
  }
}
