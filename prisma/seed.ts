import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin User
  const adminPassword = await hash('adminpassword123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentalmobil.com' },
    update: {},
    create: {
      email: 'admin@rentalmobil.com',
      name: 'Admin RentalMobil',
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
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Demo User',
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

  // 4. Create Cars (Sample Fleet)
  const cars = [
    {
      name: 'Toyota Avanza',
      brand: 'Toyota',
      category: 'MPV',
      year: 2023,
      transmission: 'Manual',
      fuelType: 'Bensin',
      seats: 7,
      pricePerDay: 300000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800']),
      features: JSON.stringify(['AC', 'Audio', 'Power Steering']),
      status: 'AVAILABLE',
      description: 'MPV nyaman untuk keluarga dengan kapasitas 7 penumpang',
    },
    {
      name: 'Honda Brio',
      brand: 'Honda',
      category: 'Hatchback',
      year: 2022,
      transmission: 'Otomatis',
      fuelType: 'Bensin',
      seats: 5,
      pricePerDay: 250000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1542362567-b07e54358753?w=800']),
      features: JSON.stringify(['AC', 'Audio', 'Power Window']),
      status: 'AVAILABLE',
      description: 'Mobil city car irit dan lincah untuk dalam kota',
    },
    {
      name: 'Toyota Innova Reborn',
      brand: 'Toyota',
      category: 'MPV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Solar',
      seats: 7,
      pricePerDay: 450000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800']),
      features: JSON.stringify(['AC', 'Audio', 'GPS', 'Leather Seats']),
      status: 'AVAILABLE',
      description: 'MPV premium dengan mesin diesel yang tangguh',
    },
    {
      name: 'Mitsubishi Pajero Sport',
      brand: 'Mitsubishi',
      category: 'SUV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Solar',
      seats: 7,
      pricePerDay: 600000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800']),
      features: JSON.stringify(['AC', 'Audio', 'GPS', '4WD', 'Leather Seats']),
      status: 'AVAILABLE',
      description: 'SUV tangguh untuk perjalanan off-road dan touring',
    },
    {
      name: 'Honda CR-V',
      brand: 'Honda',
      category: 'SUV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Bensin',
      seats: 7,
      pricePerDay: 550000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800']),
      features: JSON.stringify(['AC', 'Audio', 'GPS', 'Sunroof']),
      status: 'AVAILABLE',
      description: 'SUV urban yang nyaman dan elegan',
    },
    {
      name: 'Toyota Fortuner',
      brand: 'Toyota',
      category: 'SUV',
      year: 2023,
      transmission: 'Otomatis',
      fuelType: 'Solar',
      seats: 7,
      pricePerDay: 650000,
      images: JSON.stringify(['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800']),
      features: JSON.stringify(['AC', 'Audio', 'GPS', '4WD', 'Leather Seats', 'Sunroof']),
      status: 'AVAILABLE',
      description: 'SUV premium dengan performa tangguh',
    },
  ];

  for (const car of cars) {
    await prisma.car.create({
      data: car,
    });
  }
  console.log('✅ Sample cars created');

  // 5. Create Settings
  const settings = [
    { key: 'DP_PERCENTAGE', value: '50' },
    { key: 'PENALTY_PER_HOUR', value: '50000' },
    { key: 'PENALTY_MAX_DAYS', value: '1' },
    { key: 'WHATSAPP_NUMBER', value: '+6281234567890' },
  ];

  for (const setting of settings) {
    await prisma.setting.create({
      data: setting,
    });
  }
  console.log('✅ Settings created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
