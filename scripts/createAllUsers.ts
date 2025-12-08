/**
 * createAllUsers.ts
 * 
 * Script to create all types of users with their profiles
 * All users are created with validation: APPROVED
 * 
 * Usage:
 * 1. Update the user configurations below
 * 2. Run: npx tsx scripts/createAllUsers.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// USER CONFIGURATIONS - MODIFY THESE
// ============================================

const USERS_CONFIG = {
  // Zopper Administrator
  zopperAdmin: {
    username: 'ZopperAdmin',
    password: 'Zopperad@7408',
    fullName: 'Zopper Admin',
    phone: '0000000000',
  },

  // Samsung Administrator
  samsungAdmin: {
    username: 'SamsungAdmin',
    password: 'Samsung@123',
    fullName: 'Samsung Admin',
    phone: '1111111111',
  },

  // ABM (Area Business Manager)
  abm: {
    username: 'ABM001',
    password: 'ABM@123',
    fullName: 'Area Business Manager',
    phone: '2222222222',
    email: 'abm@example.com',
  },

  // ASE (Area Sales Executive)
  ase: {
    username: 'ASE001',
    password: 'ASE@123',
    fullName: 'Area Sales Executive',
    phone: '3333333333',
    email: 'ase@example.com',
  },

  // ZBM (Zonal Business Manager)
  zbm: {
    username: 'ZBM001',
    password: 'ZBM@123',
    fullName: 'Zonal Business Manager',
    phone: '4444444444',
    email: 'zbm@example.com',
  },

  // ZSE (Zonal Sales Executive)
  zse: {
    username: 'ZSE001',
    password: 'ZSE@123',
    fullName: 'Zonal Sales Executive',
    phone: '5555555555',
    email: 'zse@example.com',
  },

  // SEC (Sales Executive Consultant)
  sec: {
    username: '6666666666', // Phone number as username
    password: 'SEC@123',
    fullName: 'Sales Executive Consultant',
    phone: '6666666666',
    storeId: 'store_00001', // Update with actual store ID
    AgencyName: 'Sample Agency',
    AgentCode: 'AG001',
  },
};

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Creating All Users with Profiles');
  console.log('='.repeat(60));
  console.log('');

  const createdUsers: any[] = [];

  try {
    // 1. Create Zopper Administrator
    console.log('📝 Creating Zopper Administrator...');
    const zopperAdminPassword = await bcrypt.hash(USERS_CONFIG.zopperAdmin.password, 10);
    const zopperAdminUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.zopperAdmin.username,
        password: zopperAdminPassword,
        role: 'ZOPPER_ADMINISTRATOR',
        validation: 'APPROVED',
      },
    });

    await prisma.zopperAdmin.create({
      data: {
        userId: zopperAdminUser.id,
        fullName: USERS_CONFIG.zopperAdmin.fullName,
        phone: USERS_CONFIG.zopperAdmin.phone,
      },
    });

    createdUsers.push({
      role: 'ZOPPER_ADMINISTRATOR',
      username: USERS_CONFIG.zopperAdmin.username,
      password: USERS_CONFIG.zopperAdmin.password,
      userId: zopperAdminUser.id,
    });
    console.log('✅ Zopper Administrator created\n');

    // 2. Create Samsung Administrator
    console.log('📝 Creating Samsung Administrator...');
    const samsungAdminPassword = await bcrypt.hash(USERS_CONFIG.samsungAdmin.password, 10);
    const samsungAdminUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.samsungAdmin.username,
        password: samsungAdminPassword,
        role: 'SAMSUNG_ADMINISTRATOR',
        validation: 'APPROVED',
      },
    });

    await prisma.samsungAdmin.create({
      data: {
        userId: samsungAdminUser.id,
        fullName: USERS_CONFIG.samsungAdmin.fullName,
        phone: USERS_CONFIG.samsungAdmin.phone,
      },
    });

    createdUsers.push({
      role: 'SAMSUNG_ADMINISTRATOR',
      username: USERS_CONFIG.samsungAdmin.username,
      password: USERS_CONFIG.samsungAdmin.password,
      userId: samsungAdminUser.id,
    });
    console.log('✅ Samsung Administrator created\n');

    // 3. Create ABM
    console.log('📝 Creating ABM...');
    const abmPassword = await bcrypt.hash(USERS_CONFIG.abm.password, 10);
    const abmUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.abm.username,
        password: abmPassword,
        role: 'ABM',
        validation: 'APPROVED',
      },
    });

    await prisma.aBM.create({
      data: {
        userId: abmUser.id,
        fullName: USERS_CONFIG.abm.fullName,
        phone: USERS_CONFIG.abm.phone,
        email: USERS_CONFIG.abm.email,
      },
    });

    createdUsers.push({
      role: 'ABM',
      username: USERS_CONFIG.abm.username,
      password: USERS_CONFIG.abm.password,
      userId: abmUser.id,
    });
    console.log('✅ ABM created\n');

    // 4. Create ASE
    console.log('📝 Creating ASE...');
    const asePassword = await bcrypt.hash(USERS_CONFIG.ase.password, 10);
    const aseUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.ase.username,
        password: asePassword,
        role: 'ASE',
        validation: 'APPROVED',
      },
    });

    await prisma.aSE.create({
      data: {
        userId: aseUser.id,
        fullName: USERS_CONFIG.ase.fullName,
        phone: USERS_CONFIG.ase.phone,
        email: USERS_CONFIG.ase.email,
      },
    });

    createdUsers.push({
      role: 'ASE',
      username: USERS_CONFIG.ase.username,
      password: USERS_CONFIG.ase.password,
      userId: aseUser.id,
    });
    console.log('✅ ASE created\n');

    // 5. Create ZBM
    console.log('📝 Creating ZBM...');
    const zbmPassword = await bcrypt.hash(USERS_CONFIG.zbm.password, 10);
    const zbmUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.zbm.username,
        password: zbmPassword,
        role: 'ZBM',
        validation: 'APPROVED',
      },
    });

    await prisma.zBM.create({
      data: {
        userId: zbmUser.id,
        fullName: USERS_CONFIG.zbm.fullName,
        phone: USERS_CONFIG.zbm.phone,
        email: USERS_CONFIG.zbm.email,
      },
    });

    createdUsers.push({
      role: 'ZBM',
      username: USERS_CONFIG.zbm.username,
      password: USERS_CONFIG.zbm.password,
      userId: zbmUser.id,
    });
    console.log('✅ ZBM created\n');

    // 6. Create ZSE
    console.log('📝 Creating ZSE...');
    const zsePassword = await bcrypt.hash(USERS_CONFIG.zse.password, 10);
    const zseUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.zse.username,
        password: zsePassword,
        role: 'ZSE',
        validation: 'APPROVED',
      },
    });

    await prisma.zSE.create({
      data: {
        userId: zseUser.id,
        fullName: USERS_CONFIG.zse.fullName,
        phone: USERS_CONFIG.zse.phone,
        email: USERS_CONFIG.zse.email,
      },
    });

    createdUsers.push({
      role: 'ZSE',
      username: USERS_CONFIG.zse.username,
      password: USERS_CONFIG.zse.password,
      userId: zseUser.id,
    });
    console.log('✅ ZSE created\n');

    // 7. Create SEC
    console.log('📝 Creating SEC...');
    const secPassword = await bcrypt.hash(USERS_CONFIG.sec.password, 10);
    const secUser = await prisma.user.create({
      data: {
        username: USERS_CONFIG.sec.username,
        password: secPassword,
        role: 'SEC',
        validation: 'APPROVED',
      },
    });

    await prisma.sEC.create({
      data: {
        userId: secUser.id,
        fullName: USERS_CONFIG.sec.fullName,
        phone: USERS_CONFIG.sec.phone,
        storeId: USERS_CONFIG.sec.storeId,
        AgencyName: USERS_CONFIG.sec.AgencyName,
        AgentCode: USERS_CONFIG.sec.AgentCode,
      },
    });

    createdUsers.push({
      role: 'SEC',
      username: USERS_CONFIG.sec.username,
      password: USERS_CONFIG.sec.password,
      userId: secUser.id,
      storeId: USERS_CONFIG.sec.storeId,
    });
    console.log('✅ SEC created\n');

    // Print Summary
    console.log('='.repeat(60));
    console.log('✅ All Users Created Successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 CREDENTIALS SUMMARY:');
    console.log('');

    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   User ID: ${user.userId}`);
      if (user.storeId) {
        console.log(`   Store ID: ${user.storeId}`);
      }
      console.log('');
    });

    console.log('⚠️  IMPORTANT: Save these credentials securely!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('❌ Error creating users:', error);
    
    if (error.code === 'P2002') {
      console.error('\n⚠️  Duplicate user detected. Some users may already exist.');
      console.error('   Check the username or phone number and try again.');
    }
    
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
