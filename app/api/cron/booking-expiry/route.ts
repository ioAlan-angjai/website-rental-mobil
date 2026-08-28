import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runScheduler } from "@/lib/booking-utils";

// GET/POST: jalankan scheduler booking (dipanggil berkala oleh cron/admin)
// Proteksi: Bearer CRON_SECRET atau sesi ADMIN.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isTokenValid = Boolean(
      cronSecret &&
      authHeader &&
      authHeader === `Bearer ${cronSecret}`
    );

    if (!isTokenValid) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await runScheduler();
    return NextResponse.json({ success: true, message: "Scheduler berhasil dijalankan." });
  } catch (error) {
    console.error("Scheduler error:", error);
    return NextResponse.json({ error: "Gagal menjalankan scheduler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
