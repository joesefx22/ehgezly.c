// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.session.deleteMany()
  await prisma.token.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleared existing data')

  // Hash password for all users
  const hashedPassword = await hashPassword('Password123!')

  // Create users with different roles
  const users = [
    {
      name: 'Player User',
      email: 'player@example.com',
      password: hashedPassword,
      role: 'PLAYER' as const,
      isVerified: true,
      isActive: true
    },
    {
      name: 'Stadium Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: 'OWNER' as const,
      isVerified: true,
      isActive: true
    },
    {
      name: 'Employee User',
      email: 'employee@example.com',
      password: hashedPassword,
      role: 'EMPLOYEE' as const,
      isVerified: true,
      isActive: true
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN' as const,
      isVerified: true,
      isActive: true
    },
    {
      name: 'Unverified User',
      email: 'unverified@example.com',
      password: hashedPassword,
      role: 'PLAYER' as const,
      isVerified: false,
      isActive: true
    },
    {
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: hashedPassword,
      role: 'PLAYER' as const,
      isVerified: true,
      isActive: false
    }
  ]

  for (const userData of users) {
    await prisma.user.create({
      data: userData
    })
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
  console.log('🎯 Each user has different role-based access')

  // Create some audit logs for demonstration
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
        oldValue: null,
        newValue: { email: adminUser.email, role: adminUser.role },
        ipAddress: '127.0.0.1',
        userAgent: 'Seeder'
      },
      {
        userId: adminUser.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: adminUser.id,
        oldValue: null,
        newValue: { timestamp: new Date().toISOString() },
        ipAddress: '127.0.0.1',
        userAgent: 'Seeder'
      }
    ]

    for (const logData of auditLogs) {
      await prisma.auditLog.create({
        data: logData
      })
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
