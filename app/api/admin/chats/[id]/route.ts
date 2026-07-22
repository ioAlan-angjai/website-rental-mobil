import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Take Over chat dari AI ke Admin
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat melakukan aksi ini" },
        { status: 403 }
      );
    }

    const adminId = (session.user as any).id;
    const { id: chatId } = params;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

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

    // Update chat: take over oleh admin
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        handledBy: "ADMIN",
        assignedToId: adminId,
        assignedAt: new Date(),
      },
    });

    // Kirim notifikasi ke user bahwa admin telah take over
    await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: adminId,
        senderType: "ADMIN",
        message: `🟢 **Admin ${session.user.name || "CS"} telah bergabung.**\nSaya akan membantu Anda dari sini. Silakan sampaikan kebutuhan Anda.`,
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    console.error("Take over chat error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil alih chat" },
      { status: 500 }
    );
  }
}

// DELETE: Release chat (kembalikan ke AI atau tutup)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat melakukan aksi ini" },
        { status: 403 }
      );
    }

    const { id: chatId } = params;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      return NextResponse.json(
        { error: "Sesi chat tidak ditemukan" },
        { status: 404 }
      );
    }

    // Tutup chat
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        status: "CLOSED",
        handledBy: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    console.error("Release (close) chat error:", error);
    return NextResponse.json(
      { error: "Gagal menutup sesi chat" },
      { status: 500 }
    );
  }
}
