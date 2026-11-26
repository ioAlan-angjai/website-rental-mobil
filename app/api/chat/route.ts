import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateChatbotReply, ChatHistoryItem } from "@/lib/gemini-chatbot";

export const dynamic = "force-dynamic";

// GET: Ambil sesi chat aktif dan pesan miliknya
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const chat = await prisma.chat.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      chat: chat
        ? {
            id: chat.id,
            status: chat.status,
            handledBy: chat.handledBy,
          }
        : null,
      messages: chat?.messages || [],
    });
  } catch (error) {
    console.error("Customer get chat error:", error);
    return NextResponse.json({ error: "Gagal memuat pesan chat" }, { status: 500 });
  }
}

// POST: Kirim pesan baru dari user (dan balas otomatis via Gemini AI bila handledBy === "AI")
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu untuk mengirim pesan" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const trimmedMessage = message.trim().slice(0, 1000);

    // Cari atau buat chat aktif (default ditangani AI terlebih dahulu)
    let chat = await prisma.chat.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId,
          status: "ACTIVE",
          handledBy: "AI",
        },
      });
    }

    // Ambil riwayat pesan sebelumnya untuk konteks AI
    const priorMessages = await prisma.chatMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      take: 12,
      select: { senderType: true, message: true },
    });

    // Simpan pesan pengguna
    const userMsg = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        senderType: "USER",
        message: trimmedMessage,
      },
    });

    let aiMsg = null;
    let updatedHandledBy = chat.handledBy;

    // Jika sedang ditangani Asisten AI, generate balasan Gemini
    if (chat.handledBy === "AI") {
      const history: ChatHistoryItem[] = priorMessages.map((m) => ({
        role: m.senderType === "USER" ? "USER" : m.senderType === "ADMIN" ? "ADMIN" : "AI",
        message: m.message,
      }));

      const aiResult = await generateChatbotReply({
        userMessage: trimmedMessage,
        history,
        userId,
      });

      aiMsg = await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          senderType: "AI",
          message: aiResult.reply,
          isRead: true,
        },
      });

      if (aiResult.requestHandover) {
        updatedHandledBy = "ADMIN";
      }
    }

    // Perbarui waktu chat (dan handledBy jika ada eskalasi ke admin)
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
        ...(updatedHandledBy !== chat.handledBy ? { handledBy: updatedHandledBy } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: userMsg,
      aiReply: aiMsg,
      handledBy: updatedHandledBy,
    });
  } catch (error) {
    console.error("Customer send chat error:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}

// PATCH: Alihkan mode penanganan chat (AI <-> ADMIN) oleh user
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const targetMode = body?.handledBy === "ADMIN" ? "ADMIN" : body?.handledBy === "AI" ? "AI" : null;

    if (!targetMode) {
      return NextResponse.json({ error: "Mode penanganan tidak valid" }, { status: 400 });
    }

    let chat = await prisma.chat.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId,
          status: "ACTIVE",
          handledBy: targetMode,
        },
      });
    } else if (chat.handledBy !== targetMode) {
      chat = await prisma.chat.update({
        where: { id: chat.id },
        data: {
          handledBy: targetMode,
          updatedAt: new Date(),
        },
      });
    }

    const noticeText =
      targetMode === "ADMIN"
        ? "Percakapan dialihkan ke **Admin Customer Service**. Silakan tulis pesan Anda, tim kami akan segera membalas."
        : "Anda kembali terhubung dengan **Asisten AI RentalMobil**. Silakan ajukan pertanyaan Anda.";

    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        senderType: "AI",
        message: noticeText,
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      handledBy: targetMode,
    });
  } catch (error) {
    console.error("Switch chat mode error:", error);
    return NextResponse.json({ error: "Gagal mengubah mode chat" }, { status: 500 });
  }
}
