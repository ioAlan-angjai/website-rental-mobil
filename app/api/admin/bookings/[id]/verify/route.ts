import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Cek role admin
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat memverifikasi pembayaran" },
        { status: 403 }
      );
    }

    const { id: bookingId } = params;
    const body = await req.json();
    const { action, rejectReason, paymentType } = body; // action: "APPROVE" | "REJECT", paymentType: "DP" | "FULL_PAYMENT" (default: "DP")

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action tidak valid. Gunakan APPROVE atau REJECT." },
        { status: 400 }
      );
    }

    const targetType = paymentType || "DP";

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, car: true, payments: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        bookingId,
        type: targetType,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (action === "APPROVE") {
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.user?.email || "admin"
          }
        });
      } else {
        // Fallback: create dummy verified payment
        const fallbackAmount = targetType === "FULL_PAYMENT"
          ? Math.max(0, booking.totalPrice - (booking.payments || []).filter((p: any) => p.status === "VERIFIED").reduce((s: number, p: any) => s + p.amount, 0))
          : booking.dpAmount;
        await prisma.payment.create({
          data: {
            bookingId,
            amount: fallbackAmount,
            type: targetType,
            method: booking.paymentMethod || "MANUAL",
            status: "VERIFIED",
            verifiedAt: new Date(),
            verifiedBy: session.user?.email || "admin"
          }
        });
      }

      // Hitung total verified payments
      const verifiedPayments = await prisma.payment.findMany({
        where: { bookingId, status: "VERIFIED" },
      });
      const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalBill = booking.totalPrice + (booking.penaltyAmount || 0);
      const remainingAmount = Math.max(0, totalBill - totalVerified);
      const isFullyPaid = remainingAmount <= 0;

      if (targetType === "DP") {
        // Approve DP → DP_CONFIRMED + buat FULL_PAYMENT otomatis
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "DP_CONFIRMED",
            dpPaid: true,
            fullPaid: isFullyPaid,
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: session.user?.email || "admin"
          }
        });

        if (!isFullyPaid) {
          // Buat tagihan FULL_PAYMENT (PENDING) untuk sisa
          await prisma.payment.create({
            data: {
              bookingId,
              amount: remainingAmount,
              type: "FULL_PAYMENT",
              method: booking.paymentMethod || "MANUAL",
              status: "PENDING",
            }
          });
        }

        if (booking.userId) {
          const notifMsg = isFullyPaid
            ? "Pembayaran DP telah dikonfirmasi. Seluruh pembayaran sudah lunas."
            : `Pembayaran DP telah dikonfirmasi. Sisa tagihan Anda sebesar Rp ${remainingAmount.toLocaleString('id-ID')}. Silakan lakukan pelunasan setelah sewa selesai.`;
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Pembayaran DP Diterima",
              message: notifMsg,
              type: "PAYMENT_VERIFIED"
            }
          });
        }
      } else if (targetType === "FULL_PAYMENT") {
        // Approve FULL_PAYMENT → COMPLETED
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "COMPLETED",
            fullPaid: true,
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: session.user?.email || "admin"
          }
        });

        // Set car back to AVAILABLE
        if (booking.carId) {
          await prisma.car.update({
            where: { id: booking.carId },
            data: { status: "AVAILABLE" }
          });
        }

        // Buat invoice
        const invoiceNumber = `INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${booking.id.slice(-6).toUpperCase()}`;
        await prisma.invoice.create({
          data: {
            bookingId: booking.id,
            invoiceNumber,
            subtotal: booking.basePrice || booking.totalPrice,
            penalty: booking.penaltyAmount || 0,
            total: totalBill,
            paymentStatus: "PAID",
            dueDate: new Date(),
          },
        });

        if (booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Pembayaran Pelunasan Diterima & Sewa Selesai",
              message: `Pelunasan sebesar Rp ${totalVerified.toLocaleString('id-ID')} telah dikonfirmasi. Sewa mobil ${booking.car?.name || ''} telah selesai. Terima kasih!`,
              type: "RENTAL_COMPLETED"
            }
          });
        }
      }
    } else {
      // REJECT
      if (!rejectReason) {
        return NextResponse.json(
          { error: "Alasan penolakan harus diisi" },
          { status: 400 }
        );
      }

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "REJECTED",
            rejectReason
          }
        });
      }

      if (targetType === "DP") {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "REJECTED", notes: rejectReason }
        });
        // Set car back to AVAILABLE
        if (booking.carId) {
          await prisma.car.update({
            where: { id: booking.carId },
            data: { status: "AVAILABLE" }
          });
        }
        if (booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Pembayaran DP Ditolak",
              message: `Pembayaran DP ditolak: ${rejectReason}. Silakan upload bukti baru.`,
              type: "BOOKING_REJECTED"
            }
          });
        }
      } else {
        // Reject FULL_PAYMENT → tetap WAITING_PAYMENT, user upload ulang
        if (booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              title: "Bukti Pelunasan Ditolak",
              message: `Bukti pelunasan ditolak: ${rejectReason}. Silakan upload bukti baru.`,
              type: "PAYMENT_REJECTED"
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan ${action} pada pembayaran ${targetType}.`
    });

  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses verifikasi" },
      { status: 500 }
    );
  }
}
