import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { handleAIChat } from "@/lib/ai/chatbot";
import { generateGuestId } from "@/lib/prisma";

// Helper: extract userId from session or guest header
async function resolveSender(
  req: NextRequest
): Promise<{ userId: string; isGuest: boolean } | NextResponse> {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    return { userId: (session.user as any).id, isGuest: false };
  }

  // Guest mode: baca guest_session_id dari header
  const guestId = req.headers.get("x-guest-session-id");
  if (guestId && guestId.startsWith("guest_")) {
    return { userId: guestId, isGuest: true };
  }

  // Tidak ada session dan tidak ada guest header
  return NextResponse.json(
    { error: "Silakan login terlebih dahulu" },
    { status: 401 }
  ) as NextResponse;
}

// GET: ambil atau buat chat session
export async function GET(req: NextRequest) {
  try {
    const resolved = await resolveSender(req);
    if (resolved instanceof NextResponse) return resolved;

    const { userId, isGuest } = resolved;

    // Cari chat ACTIVE milik user ini
    let chat = await prisma.chat.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    // Jika belum ada chat, buat baru
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId,
          status: "ACTIVE",
          handledBy: "AI",
        },
        include: {
          messages: {
            include: {
              sender: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      isGuest,
      chat: {
        id: chat.id,
        status: chat.status,
        handledBy: chat.handledBy,
        assignedTo: chat.assignedTo,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map((m) => ({
          id: m.id,
          message: m.message,
          senderType: m.senderType,
          senderId: m.senderId,
          sender: m.sender,
          createdAt: m.createdAt,
        })),
      },
      messageCount: chat.messages.length,
    });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil chat" },
      { status: 500 }
    );
  }
}

// POST: kirim pesan
export async function POST(req: NextRequest) {
  try {
    const resolved = await resolveSender(req);
    if (resolved instanceof NextResponse) return resolved;

    const { userId, isGuest } = resolved;
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Cari atau buat chat session — handle both authenticated and guest
    let chat = await prisma.chat.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    if (!chat) {
      // Untuk guest: pastikan user record ada dulu
      if (isGuest) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: userId,
              name: "Guest User",
              email: `${userId}@guest.local`,
              role: "USER",
            },
          });
        }
      }

      chat = await prisma.chat.create({
        data: {
          userId,
          status: "ACTIVE",
          handledBy: "AI",
        },
      });
    }

    // Simpan pesan user — GUEST juga pakai userId yg sama (guest_xxx)
    const userMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        senderType: "USER",
        message: message.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Update timestamp chat
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    let aiResponse = null;
    let shouldEscalate = false;
    let aiMessageRecord = null;

    // Proses dengan AI jika chat masih di-handle AI
    if (chat.handledBy === "AI") {
      try {
        const result = await handleAIChat(chat.id, message.trim(), userId);
        aiResponse = result.aiMessage;
        shouldEscalate = result.shouldEscalate;

        if (shouldEscalate) {
          await prisma.chat.update({
            where: { id: chat.id },
            data: { handledBy: "ADMIN" },
          });
        }

        // SIMPAN AI response ke DB agar polling sinkron
        if (aiResponse) {
          // Ambil AI bot user (atau fallback ke system)
          const botUser = await prisma.user.findFirst({
            where: { role: "ADMIN" },
            select: { id: true },
          });
          aiMessageRecord = await prisma.chatMessage.create({
            data: {
              chatId: chat.id,
              senderId: botUser?.id || userId,
              senderType: "AI",
              message: aiResponse,
            },
          });
        }

        // Notifikasi admin (guest atau user)
        const userDisplay = isGuest
          ? `Guest (${userId.slice(0, 12)}...)`
          : (userMessage.sender?.name || userMessage.sender?.email || "User");
        const adminUsers = await prisma.user.findMany({
          where: { role: "ADMIN" },
        });

        for (const admin of adminUsers) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: shouldEscalate
                ? "Pesan Chat Baru — Butuh Perhatian Admin"
                : "Pesan Chat Baru",
              message: `${userDisplay}: "${message.trim().substring(0, 80)}..."`,
              type: "CHAT_MESSAGE",
              link: `/livechat-cs`,
            },
          });
        }
      } catch (aiError) {
        console.error("AI processing error:", aiError);
        aiResponse = null;
        shouldEscalate = true;

        await prisma.chat.update({
          where: { id: chat.id },
          data: { handledBy: "ADMIN" },
        });
      }
    } else {
      // Chat sudah di-handle admin, tetap kirim notifikasi
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "Pesan Baru — Chat Aktif",
            message: `User ${userId.slice(0, 12)}...: "${message.trim().substring(0, 50)}..."`,
            type: "CHAT_MESSAGE",
            link: `/livechat-cs`,
          },
        });
      }
    }

    // Hitung total messages di DB untuk sinkronisasi client
    const totalMessageCount = await prisma.chatMessage.count({
      where: { chatId: chat.id },
    });

    // Touch chat updatedAt
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      isGuest,
      message: userMessage,
      aiResponse,
      aiMessageId: aiMessageRecord?.id || null,
      handledBy: shouldEscalate ? "ADMIN" : "AI",
      messageCount: totalMessageCount,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim pesan" },
      { status: 500 }
    );
  }
}
