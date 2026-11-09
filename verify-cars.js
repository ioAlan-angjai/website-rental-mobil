const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCars() {
  console.log('🔍 Verifying cars in database...\n');

  const cars = await prisma.car.findMany({
    orderBy: { pricePerDay: 'asc' },
  });

  console.log(`📊 Total cars in database: ${cars.length}\n`);
  console.log('═'.repeat(80));

  cars.forEach((car, index) => {
    console.log(`\n${index + 1}. ${car.name}`);
    console.log(`   Brand: ${car.brand}`);
    console.log(`   Category: ${car.category}`);
    console.log(`   Seats: ${car.seats} penumpang`);
    console.log(`   Transmission: ${car.transmission}`);
    console.log(`   Fuel: ${car.fuelType}`);
    console.log(`   Price: Rp ${car.pricePerDay.toLocaleString('id-ID')}/hari`);
    console.log(`   Status: ${car.status}`);
  });

  console.log('\n' + '═'.repeat(80));

  const carsByCategory = await prisma.car.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  console.log('\n📈 Cars by Category:');
  carsByCategory.forEach((cat) => {
    console.log(`   ${cat.category}: ${cat._count.id} units`);
  });

  const carsByStatus = await prisma.car.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  console.log('\n✅ Cars by Status:');
  carsByStatus.forEach((stat) => {
    console.log(`   ${stat.status}: ${stat._count.id} units`);
  });

  console.log('\n✅ Verification complete!\n');
}

verifyCars()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
