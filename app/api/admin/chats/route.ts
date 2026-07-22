import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: daftar chat untuk admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat mengakses pesan chat" },
        { status: 403 }
      );
    }

    const adminId = (session.user as any).id;

    const chats = await prisma.chat.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: chats.map((chat) => ({
        id: chat.id,
        userId: chat.userId,
        status: chat.status,
        handledBy: chat.handledBy,
        assignedTo: chat.assignedTo,
        user: chat.user,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Admin fetch chats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil daftar chat" },
      { status: 500 }
    );
  }
}
