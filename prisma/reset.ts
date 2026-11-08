import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🧹 Memulai proses pembersihan database (Reset ke 0)...');

  try {
    // 1. Hapus pesan chat dan percakapan
    const deletedChatMessages = await prisma.chatMessage.deleteMany({});
    console.log(`✅ Chat messages dihapus: ${deletedChatMessages.count}`);

    const deletedChats = await prisma.chat.deleteMany({});
    console.log(`✅ Chat rooms dihapus: ${deletedChats.count}`);

    // 2. Hapus semua notifikasi
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`✅ Notifikasi dihapus: ${deletedNotifications.count}`);

    // 3. Hapus data pembayaran dan invoice
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`✅ Invoices dihapus: ${deletedInvoices.count}`);

    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✅ Payments/bukti transfer dihapus: ${deletedPayments.count}`);

    // 4. Hapus seluruh riwayat booking
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`✅ Riwayat booking dihapus: ${deletedBookings.count}`);

    // 5. Hapus semua mobil dan driver
    const deletedCars = await prisma.car.deleteMany({});
    console.log(`✅ Data mobil dihapus: ${deletedCars.count}`);

    const deletedDrivers = await prisma.driver.deleteMany({});
    console.log(`✅ Data driver dihapus: ${deletedDrivers.count}`);

    // 6. Hapus ulasan/testimoni
    const deletedTestimonials = await prisma.testimonial.deleteMany({});
    console.log(`✅ Testimoni dihapus: ${deletedTestimonials.count}`);

    // 7. Hapus token reset password & verifikasi
    await prisma.passwordResetToken.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    console.log('✅ Token reset password & verifikasi dibersihkan');

    // 8. Hapus OAuth Account & Session milik pelanggan (bukan ADMIN)
    await prisma.account.deleteMany({
      where: {
        user: { role: { not: 'ADMIN' } },
      },
    });
    await prisma.session.deleteMany({
      where: {
        user: { role: { not: 'ADMIN' } },
      },
    });
    console.log('✅ Sesi & akun OAuth pelanggan dibersihkan');

    // 9. Hapus semua akun pelanggan (kecuali ADMIN)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: { not: 'ADMIN' },
      },
    });
    console.log(`✅ Akun pelanggan dihapus: ${deletedUsers.count}`);

    // 10. Pastikan Akun Admin tetap ada dan password tidak diubah
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log(`🔒 Akun Admin dipertahankan: ${existingAdmin.email} (Password tetap sama)`);
    } else {
      console.log('⚠️ Tidak ditemukan admin aktif. Membuat akun admin default...');
      const adminPassword = await hash('adminpassword123', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@rentalmobil.com',
          name: 'Admin RentalMobil Jogja',
          password: adminPassword,
          role: 'ADMIN',
          phone: '+6281234567890',
        },
      });
      console.log(`✅ Admin dibuat: ${newAdmin.email} / adminpassword123`);
    }

    console.log('\n🎉 SUKSES! Database telah bersih dan dimulai dari 0.');
    console.log('   - Mobil: 0');
    console.log('   - Pelanggan: 0');
    console.log('   - Riwayat Booking: 0');
    console.log('   - Driver: 0');
    console.log('   - Chat & Notifikasi: 0');
    console.log('   - Akun & Password Admin: TETAP AMAN');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat mereset database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

