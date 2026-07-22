import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: ambil pesan dari suatu chat
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { id: chatId } = params;

    // Validasi chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, userId: true, handledBy: true, assignedToId: true },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Sesi chat tidak ditemukan" },
        { status: 404 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      chat: {
        id: chat.id,
        handledBy: chat.handledBy,
        assignedToId: chat.assignedToId,
      },
      data: messages,
    });
  } catch (error) {
    console.error("Admin fetch chat messages error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat pesan" },
      { status: 500 }
    );
  }
}

// POST: admin mengirim pesan
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat membalas chat" },
        { status: 403 }
      );
    }

    const adminId = (session.user as any).id;
    const { id: chatId } = params;
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Sesi chat tidak ditemukan" },
        { status: 404 }
      );
    }

    if (chat.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Sesi chat sudah ditutup" },
        { status: 400 }
      );
    }

    // Jika chat masih di-handle AI, take over otomatis
    if (chat.handledBy === "AI") {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          handledBy: "ADMIN",
          assignedToId: adminId,
          assignedAt: new Date(),
        },
      });
    }

    // Buat pesan admin
    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: adminId,
        senderType: "ADMIN",
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Touch chat updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Admin send message error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pesan" },
      { status: 500 }
    );
  }
}
