import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data to prevent duplicate records and unique constraint errors
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.setting.deleteMany({});

  // 1. Create Admin User
  const adminPassword = await hash('adminpassword123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentalmobil.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@rentalmobil.com',
      name: 'Admin RentalMobil Jogja',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+6281234567890',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Demo User
  const userPassword = await hash('user123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      password: userPassword,
      role: 'USER',
    },
    create: {
      email: 'user@example.com',
      name: 'Demo User Jogja',
      password: userPassword,
      role: 'USER',
      phone: '+6289876543210',
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // 3. Create Bank Accounts
  const banks = [
    { bankName: 'BCA', accountNumber: '1234567890', accountName: 'PT RentalMobil Jogja' },
    { bankName: 'BNI', accountNumber: '0987654321', accountName: 'PT RentalMobil Jogja' },
    { bankName: 'Mandiri', accountNumber: '1122334455', accountName: 'PT RentalMobil Jogja' },
  ];

  for (const bank of banks) {
    await prisma.bankAccount.create({
      data: bank,
    });
  }
  console.log('✅ Bank accounts created');

  // 4. Create Cars (Rich Fleet of Cars)
  const cars = [
    {
      name: 'Toyota Avanza 1.3 E M/T',
      brand: 'Toyota',
      category: 'MPV',
      year: 2022,
      transmission: 'Manual',
      fuelType: 'Bensin',
      seats: 7,
      pricePerDay: 300000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['AC Double Blower', 'Audio Bluetooth', 'Power Steering', 'Airbags']),
      status: 'AVAILABLE',
      description: 'MPV 7 penumpang paling populer dan irit, sempurna untuk liburan keluarga di Jogja.',
    },
    {
      name: 'Honda Brio Satya 1.2 E M/T',
      brand: 'Honda',
      category: 'Hatchback',
      year: 2022,
      transmission: 'Manual',
      fuelType: 'Bensin',
      seats: 5,
      pricePerDay: 250000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['AC Dingin', 'Audio USB', 'Power Window', 'Parking Sensor']),
      status: 'AVAILABLE',
      description: 'City car lincah, sangat irit bahan bakar dan mudah bermanuver di jalanan kota Jogja.',
    },
    {
      name: 'Toyota All New Avanza 1.5 G CVT',
      brand: 'Toyota',
      category: 'MPV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Bensin',
      seats: 7,
      pricePerDay: 350000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['AC Digital', 'Touchscreen Audio', 'Keyless Entry', 'Rear Camera']),
      status: 'AVAILABLE',
      description: 'Generasi baru Avanza penggerak roda depan dengan transmisi CVT yang luar biasa halus.',
    },
    {
      name: 'Toyota Innova Reborn 2.4 G Diesel',
      brand: 'Toyota',
      category: 'MPV',
      year: 2022,
      transmission: 'Otomatis',
      fuelType: 'Solar',
      seats: 7,
      pricePerDay: 500000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['Mesin Diesel 2GD', 'Kabin Ekstra Senyap', 'AC Triple Blower', 'Eco/Power Mode']),
      status: 'AVAILABLE',
      description: 'MPV tangguh dengan mesin diesel bertenaga, kabin sangat senyap, dan kenyamanan suspensi prima.',
    },
    {
      name: 'Toyota Innova Zenix 2.0 G',
      brand: 'Toyota',
      category: 'MPV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Bensin',
      seats: 7,
      pricePerDay: 650000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['Platform TNGA', 'Captain Seat', 'Electric Parking Brake', 'Paddle Shift']),
      status: 'AVAILABLE',
      description: 'Innova generasi terbaru dengan platform TNGA, kabin ekstra lapang, dan teknologi berkendara modern.',
    },
    {
      name: 'Mitsubishi Pajero Sport Dakar 4x2',
      brand: 'Mitsubishi',
      category: 'SUV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Solar',
      seats: 7,
      pricePerDay: 750000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['Sunroof', 'Leather Seats', 'FCM System', 'Hill Start Assist']),
      status: 'AVAILABLE',
      description: 'SUV gagah dan mewah dengan tenaga melimpah untuk perjalanan prestisius di Yogyakarta.',
    },
    {
      name: 'Toyota Fortuner 2.8 VRZ',
      brand: 'Toyota',
      category: 'SUV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Solar',
      seats: 7,
      pricePerDay: 800000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['Mesin 2.8L Monster', 'Power Backdoor', 'Wireless Charger', 'Blind Spot Monitor']),
      status: 'AVAILABLE',
      description: 'SUV tangguh kasta tertinggi dengan performa mesin 2800cc yang bertenaga untuk segala rute.',
    },
    {
      name: 'Toyota Hiace Commuter 15 Seat',
      brand: 'Toyota',
      category: 'ELF',
      year: 2022,
      transmission: 'Manual',
      fuelType: 'Solar',
      seats: 15,
      pricePerDay: 1100000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      ]),
      features: JSON.stringify(['15 Kursi Nyaman', 'AC Plafon Tiap Baris', 'Audio Karaoke', 'Bagasi Luas']),
      status: 'AVAILABLE',
      description: 'Microbus premium dengan kenyamanan suspensi setara MPV untuk rombongan wisata keluarga.',
    },
  ];

  for (const car of cars) {
    await prisma.car.create({
      data: car,
    });
  }
  console.log('✅ Sample cars created');

  // 5. Create Drivers
  const drivers = [
    {
      name: 'Pak Joko Santoso',
      phone: '081298765432',
      address: 'Malioboro, Danurejan, Yogyakarta',
      initialExperience: 5,
      status: 'READY',
      rating: 4.9,
    },
    {
      name: 'Mas Budi Prasetyo',
      phone: '081345678901',
      address: 'Condongcatur, Depok, Sleman',
      initialExperience: 3,
      status: 'READY',
      rating: 5.0,
    },
    {
      name: 'Mas Dimas Kurniawan',
      phone: '085712345678',
      address: 'Bantul, D.I. Yogyakarta',
      initialExperience: 4,
      status: 'READY',
      rating: 4.8,
    },
  ];

  for (const driver of drivers) {
    await prisma.driver.create({
      data: driver,
    });
  }
  console.log('✅ Sample drivers created');

  // 6. Create Testimonials
  const testimonials = [
    {
      name: 'Dimas Saputra',
      role: 'Karyawan Swasta - Jakarta',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Sangat puas menyewa mobil Brio lepas kunci di sini. Kondisi mobil bersih, terawat, dan proses serah terima di bandara YIA sangat cepat dan profesional.',
      carUsed: 'Honda Brio Satya',
      featured: true,
    },
    {
      name: 'Fitri Astuti',
      role: 'Ibu Rumah Tangga - Bandung',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Pelayanan istimewa! Kami sewa Innova Reborn include driver selama 4 hari untuk keliling Jogja-Magelang. Drivernya sangat ramah, sopan, dan tahu jalan pintas tanpa macet.',
      carUsed: 'Toyota Innova Reborn',
      featured: true,
    },
    {
      name: 'Reza Fahlevi',
      role: 'Fotografer & Traveler - Surabaya',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Pajero Sport yang kami sewa dalam kondisi prima untuk medan perbukitan Gunungkidul dan Merapi. Harga sangat bersaing dan tidak ada biaya tersembunyi.',
      carUsed: 'Mitsubishi Pajero Sport',
      featured: true,
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Mahasiswi UGM - Yogyakarta',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Booking melalui website sangat mudah dan cepat. Customer service ramah dan responsif saat kami butuh perpanjangan sewa dadakan.',
      carUsed: 'Toyota All New Avanza',
      featured: true,
    },
    {
      name: 'Bambang Wijaya',
      role: 'Event Organizer - Solo',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Sewa Hiace Commuter untuk tamu delegasi kantor. Mobil sangat wangi, AC dingin menggigit, driver tepat waktu datang sebelum jadwal.',
      carUsed: 'Toyota Hiace Commuter',
      featured: true,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t,
    });
  }
  console.log('✅ Testimonials created');

  // 7. Create Settings
  const settings = [
    { key: 'DP_PERCENTAGE', value: '50' },
    { key: 'PENALTY_PER_HOUR', value: '50000' },
    { key: 'PENALTY_MAX_DAYS', value: '1' },
    { key: 'WHATSAPP_NUMBER', value: '+6281234567890' },
    { key: 'DRIVER_FEE_PER_DAY', value: '150000' },
  ];

  for (const setting of settings) {
    await prisma.setting.create({
      data: setting,
    });
  }
  console.log('✅ Settings created');

  console.log('🎉 Supabase PostgreSQL Database seeded successfully with real data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
