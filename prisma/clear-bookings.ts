import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearBookings() {
  console.log('🧹 Menghapus seluruh data booking di database...');

  try {
    // 1. Hapus data turunan booking (Invoice & Payment)
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`✅ Invoices dihapus: ${deletedInvoices.count}`);

    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✅ Payments dihapus: ${deletedPayments.count}`);

    // 2. Hapus seluruh data booking
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`✅ Data booking dihapus: ${deletedBookings.count}`);

    // 3. Kembalikan status mobil yang sedang BOOKED menjadi AVAILABLE
    const resetCars = await prisma.car.updateMany({
      where: { status: 'BOOKED' },
      data: { status: 'AVAILABLE' },
    });
    console.log(`✅ Status mobil dikembalikan ke AVAILABLE: ${resetCars.count}`);

    console.log('\n🎉 Selesai! Hanya data booking (beserta payment & invoice terkait) yang dihapus.');
    console.log('   Mobil, pelanggan, driver, chat, dan pengaturan tetap aman.');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat menghapus data booking:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

clearBookings();

