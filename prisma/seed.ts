// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ✅ Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleared existing data')

  // ✅ Hash password once
  const hashedPassword = await bcrypt.hash('Password123!', 10)

  // ✅ Create users
  const users = [
    {
      name: 'Player User',
      email: 'player@example.com',
      password: hashedPassword,
      role: 'PLAYER' as const,
      isVerified: true,
      isActive: true,
      phoneNumber: "01000000000",
      age: 25
    },
    {
      name: 'Stadium Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: 'OWNER' as const,
      isVerified: true,
      isActive: true,
      phoneNumber: "01000000001",
      age: 30
    },
    {
      name: 'Employee User',
      email: 'employee@example.com',
      password: hashedPassword,
      role: 'EMPLOYEE' as const,
      isVerified: true,
      isActive: true,
      phoneNumber: "01000000002",
      age: 28
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN' as const,
      isVerified: true,
      isActive: true,
      phoneNumber: "01000000003",
      age: 35
    },
    {
      name: 'Unverified User',
      email: 'unverified@example.com',
      password: hashedPassword,
      role: 'PLAYER' as const,
      isVerified: false,
      isActive: true,
      phoneNumber: "01000000004",
      age: 22
    },
    {
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: hashedPassword,
      role: 'PLAYER' as const,
      isVerified: true,
      isActive: false,
      phoneNumber: "01000000005",
      age: 27
    }
  ]

  for (const userData of users) {
    await prisma.user.create({ data: userData })
  }

  console.log('✅ Created 6 test users')
  console.log('📋 Test Credentials:')
  console.log('--------------------')
  console.log('Email: player@example.com')
  console.log('Email: owner@example.com')
  console.log('Email: employee@example.com')
  console.log('Email: admin@example.com')
  console.log('Password: Password123!')
  console.log('--------------------')

  // ✅ Create sample audit logs
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@example.com' }
  })

  if (adminUser) {
    const auditLogs = [
      {
        userId: adminUser.id,
        action: 'REGISTER',
        entityType: 'USER',
        entityId: adminUser.id,
        oldValue: Prisma.JsonNull,
        newValue: { email: adminUser.email, role: adminUser.role },
        ipAddress: '127.0.0.1',
        userAgent: 'Seeder'
      },
      {
        userId: adminUser.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: adminUser.id,
        oldValue: Prisma.JsonNull,
        newValue: { timestamp: new Date().toISOString() },
        ipAddress: '127.0.0.1',
        userAgent: 'Seeder'
      }
    ]

    for (const logData of auditLogs) {
      await prisma.auditLog.create({ data: logData })
    }

    console.log('📝 Created sample audit logs')
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
