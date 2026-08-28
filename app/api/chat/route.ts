import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Ambil sesi chat aktif dan pesan miliknya
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Cari chat aktif
    let chat = await prisma.chat.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      chat: chat || null,
      messages: chat?.messages || [],
    });
  } catch (error) {
    console.error("Customer get chat error:", error);
    return NextResponse.json({ error: "Gagal memuat pesan chat" }, { status: 500 });
  }
}

// POST: Kirim pesan baru dari user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk mengirim pesan" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    // Cari atau buat chat aktif
    let chat = await prisma.chat.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId,
          status: "ACTIVE",
          handledBy: "ADMIN",
        },
      });

      // Tambahkan pesan sambutan otomatis
      await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          senderType: "AI",
          message: "Halo! Selamat datang di Rental Mobil Jogja. Customer Service kami akan segera merespons pertanyaan Anda.",
        },
      });
    }

    // Buat pesan pengguna
    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        senderType: "USER",
        message: message.trim(),
      },
    });

    // Perbarui waktu chat
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Customer send chat error:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
