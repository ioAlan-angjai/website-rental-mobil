import { PrismaClient } from '@prisma/client';

// Generate UUID v4 sederhana untuk guest session
export function generateGuestId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'guest_';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
