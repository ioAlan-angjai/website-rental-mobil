import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const type = formData.get("type");
    const file = formData.get("file");

    if (!type || !file) {
      return NextResponse.json({ error: "Tipe dokumen dan file wajib diisi" }, { status: 400 });
    }

    if (type !== "ktp" && type !== "sim") {
      return NextResponse.json({ error: "Tipe dokumen harus 'ktp' atau 'sim'" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak valid" }, { status: 400 });
    }

    // Validasi ukuran file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    // Validasi tipe file (gambar)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar" },
        { status: 400 }
      );
    }

    // Konversi file ke base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Simpan ke database
    const updateData = type === "ktp" ? { ktpImage: base64Image } : { simImage: base64Image };

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `${type === "ktp" ? "KTP" : "SIM"} berhasil diupload`,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
