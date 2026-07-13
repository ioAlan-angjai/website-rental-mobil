import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Cari atau buat chat session
    let chat = await prisma.chat.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE"
      },
      include: {
        messages: {
          include: {
            sender: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Jika belum ada chat, buat baru
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          status: "ACTIVE"
        },
        include: {
          messages: {
            include: {
              sender: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      chat
    });

  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil chat" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Cari atau buat chat session
    let chat = await prisma.chat.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE"
      }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          status: "ACTIVE"
        }
      });
    }

    // Create message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        message
      },
      include: {
        sender: true
      }
    });

    // Buat notifikasi untuk admin
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" }
    });

    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Pesan Chat Baru",
          message: `User ${session.user.name || session.user.email} mengirim pesan di chat: ${message.substring(0, 50)}...`,
          type: "CHAT_MESSAGE"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: chatMessage
    });

  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim pesan" },
      { status: 500 }
    );
  }
}
