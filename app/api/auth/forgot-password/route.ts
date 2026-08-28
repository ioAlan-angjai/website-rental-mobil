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

    // In production, send via email provider (e.g. Resend)
    // Log in development console only
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AUTH] Password reset requested for ${email}. Token: ${token}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Instruksi reset password telah dikirim jika email terdaftar."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
