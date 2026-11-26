import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { generateChatbotReply, ChatHistoryItem } from "@/lib/gemini-chatbot";

const limiter = createRateLimiter({
  interval: 60 * 1000,
  maxRequests: 20,
});

// POST: Endpoint Asisten AI untuk pengunjung (guest / belum login)
export async function POST(req: NextRequest) {
  const rateLimitResult = limiter(req);
  if (rateLimitResult) return rateLimitResult;

  try {
    const body = await req.json();
    const rawMessage = body?.message;

    if (!rawMessage || typeof rawMessage !== "string" || !rawMessage.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const safeHistory: ChatHistoryItem[] = rawHistory
      .slice(-10)
      .filter((item: any) => item && typeof item.message === "string")
      .map((item: any) => ({
        role: item.role === "USER" ? "USER" : "AI",
        message: item.message.slice(0, 1000),
      }));

    const result = await generateChatbotReply({
      userMessage: rawMessage.trim().slice(0, 1000),
      history: safeHistory,
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      usedFallback: result.usedFallback,
    });
  } catch (error) {
    console.error("Guest AI assistant error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan sementara pada Asisten AI" },
      { status: 500 }
    );
  }
}

