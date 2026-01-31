import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'Samsung@Admin123';
  
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1) Create the User
  const user = await prisma.user.create({
    data: {
      username: 'SamsungAdmin',
      password: hashedPassword,
      role: 'SAMSUNG_ADMINISTRATOR',
      validation: 'APPROVED',
      metadata: null,
    },
  });

  // 2) Create the SamsungAdmin profile linked to that user
  await prisma.samsungAdmin.create({
    data: {
      userId: user.id,
      fullName: 'Samsung Administrator',
      phone: '9999999999',
    },
  });

  console.log('✅ Created Samsung Administrator and profile');
  console.log('   User ID:', user.id);
  console.log('   Username:', user.username);
  console.log('   Password:', plainPassword);
  console.log('   Role:', user.role);
  console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
