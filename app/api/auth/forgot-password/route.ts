import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Token reset password berhasil dibuat",
      token // Untuk testing
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
