import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Owner', email: 'owner@test.com', password: 'owner123', role: 'OWNER', mustChangePassword: false },
    { name: 'Rahul', email: 'rahul@test.com', password: 'host123',  role: 'HOST',  mustChangePassword: true  },
    { name: 'Priya', email: 'priya@test.com', password: 'host123',  role: 'HOST',  mustChangePassword: true  },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { mustChangePassword: u.mustChangePassword },
      create: {
        name: u.name, email: u.email, passwordHash,
        role: u.role, mustChangePassword: u.mustChangePassword, isActive: true
      }
    });
    console.log(`✓ ${u.role}: ${u.email} / ${u.password} | mustChangePassword: ${u.mustChangePassword}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
