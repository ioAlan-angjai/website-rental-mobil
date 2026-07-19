import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runScheduler } from "@/lib/booking-utils";

// GET/POST: jalankan scheduler booking (dipanggil berkala oleh cron/admin)
// Proteksi: hanya admin.
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await runScheduler();
    return NextResponse.json({ success: true, message: "Scheduler dijalankan." });
  } catch (error) {
    console.error("Scheduler error:", error);
    return NextResponse.json({ error: "Gagal menjalankan scheduler" }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  return GET(_req);
}
