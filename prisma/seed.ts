import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@garage.com' },
    update: {},
    create: {
      email: 'admin@garage.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user');

  // Create owner users
  const owner1Password = await bcrypt.hash('Owner@123456', 10);
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner@garage.com' },
    update: {},
    create: {
      email: 'owner@garage.com',
      name: 'John Garage Owner',
      password: owner1Password,
      role: 'OWNER',
    },
  });

  const owner2Password = await bcrypt.hash('Owner@123456', 10);
  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@garage.com' },
    update: {},
    create: {
      email: 'owner2@garage.com',
      name: 'Sarah Garage Owner',
      password: owner2Password,
      role: 'OWNER',
    },
  });
  console.log('✅ Created owner users');

  // Create regular users
  const user1Password = await bcrypt.hash('User@123456', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'user@garage.com' },
    update: {},
    create: {
      email: 'user@garage.com',
      name: 'Alice Johnson',
      password: user1Password,
      role: 'USER',
    },
  });

  const user2Password = await bcrypt.hash('User@123456', 10);
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@garage.com' },
    update: {},
    create: {
      email: 'user2@garage.com',
      name: 'Bob Smith',
      password: user2Password,
      role: 'USER',
    },
  });
  console.log('✅ Created regular users');

  // Create sample garages
  const garage1 = await prisma.garage.create({
    data: {
      name: 'AutoFix Pro',
      location: 'New York, NY',
      address: '123 Main Street',
      city: 'New York',
      postalCode: '10001',
      phone: '+1-555-0123',
      specialties: ['MECHANIC', 'ELECTRIC'],
      description: 'Professional auto repair services with 20+ years of experience. We specialize in mechanical repairs and electrical diagnostics for all vehicle makes and models.',
      isApproved: true,
      subscriptionActive: true,
      ownerId: owner1.id,
    },
  });

  const garage2 = await prisma.garage.create({
    data: {
      name: 'Elite Body Shop',
      location: 'Los Angeles, CA',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      postalCode: '90001',
      phone: '+1-555-0456',
      specialties: ['BODY_REPAIR'],
      description: 'Premium bodywork and paint services. We restore your vehicle to its original condition with precision and care.',
      isApproved: true,
      subscriptionActive: true,
      ownerId: owner2.id,
    },
  });

  const garage3 = await prisma.garage.create({
    data: {
      name: 'Complete Car Care',
      location: 'Chicago, IL',
      address: '789 Elm Street',
      city: 'Chicago',
      postalCode: '60601',
      phone: '+1-555-0789',
      specialties: ['MECHANIC', 'ELECTRIC', 'BODY_REPAIR', 'ALL_SERVICES'],
      description: 'Full-service automotive repair center offering comprehensive solutions for all your car needs.',
      isApproved: true,
      subscriptionActive: false, // Needs subscription
      ownerId: owner2.id,
    },
  });

  console.log('✅ Created sample garages');

  // Create sample appointments
  const appointment1 = await prisma.appointment.create({
    data: {
      userId: user1.id,
      garageId: garage1.id,
      carModel: 'Toyota Camry',
      carYear: '2019',
      description: 'Engine making strange noises, needs inspection',
      status: 'CONFIRMED',
      costEstimate: 350.00,
      durationDays: 2,
      appointmentDate: new Date('2025-11-15T10:00:00'),
      ownerNotes: 'Scheduled for diagnostic check. Please bring vehicle by 10 AM.',
      confirmedAt: new Date(),
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      userId: user2.id,
      garageId: garage2.id,
      carModel: 'Honda Civic',
      carYear: '2021',
      description: 'Minor dent on rear door, need estimate for repair',
      status: 'PENDING',
    },
  });

  const appointment3 = await prisma.appointment.create({
    data: {
      userId: user1.id,
      garageId: garage1.id,
      carModel: 'Toyota Camry',
      carYear: '2019',
      description: 'Oil change and general maintenance',
      status: 'DONE',
      costEstimate: 75.00,
      durationDays: 1,
      appointmentDate: new Date('2025-11-01T09:00:00'),
      ownerNotes: 'Completed oil change and 20-point inspection.',
      confirmedAt: new Date('2025-10-30'),
      completedAt: new Date('2025-11-01'),
    },
  });

  console.log('✅ Created sample appointments');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('Admin: admin@garage.com / Admin@123456');
  console.log('Owner: owner@garage.com / Owner@123456');
  console.log('User: user@garage.com / User@123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
