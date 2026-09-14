import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
    },
  });
  console.log('Admin user seeded (admin / admin123).');

  // The recurring timetable (initial assignment to Seminar 1)
  const initialClasses = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '09:00', name: 'N Anaesthesia' },
    { dayOfWeek: 1, startTime: '15:00', endTime: '17:00', name: 'Neurology' },
    
    { dayOfWeek: 2, startTime: '08:00', endTime: '09:00', name: 'N Anaesthesia' },
    { dayOfWeek: 2, startTime: '15:00', endTime: '17:00', name: 'Neurosurgery' },
    
    { dayOfWeek: 3, startTime: '08:00', endTime: '09:00', name: 'N Surgery' },
    { dayOfWeek: 3, startTime: '11:00', endTime: '13:00', name: 'Nursing Class' },
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:00', name: 'Neurology' },
    { dayOfWeek: 3, startTime: '16:00', endTime: '17:00', name: 'Neurosurgery' },
    
    { dayOfWeek: 4, startTime: '08:00', endTime: '09:00', name: 'N Surgery' },
    { dayOfWeek: 4, startTime: '11:00', endTime: '13:00', name: 'Nursing Class' },
    { dayOfWeek: 4, startTime: '16:00', endTime: '17:00', name: 'Neurology' },
    
    { dayOfWeek: 5, startTime: '08:00', endTime: '09:00', name: 'N Anaesthesia' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '15:00', name: 'Every Pediatric Neurosurgery' },
    { dayOfWeek: 5, startTime: '15:30', endTime: '17:00', name: 'Neuro Pathology' },
    
    { dayOfWeek: 6, startTime: '08:00', endTime: '09:00', name: 'N Surgery' },
  ];

  let addedClasses = 0;
  for (const c of initialClasses) {
    // Check if exists
    const existing = await prisma.event.findFirst({
      where: {
        name: c.name,
        dayOfWeek: c.dayOfWeek,
        startTime: c.startTime,
        endTime: c.endTime,
        isRecurring: true,
      },
    });

    if (!existing) {
      await prisma.event.create({
        data: {
          name: c.name,
          type: 'CLASS',
          isRecurring: true,
          dayOfWeek: c.dayOfWeek,
          startTime: c.startTime,
          endTime: c.endTime,
          room: 'SEMINAR_1',
        },
      });
      addedClasses++;
    }
  }

  console.log(`Seeding completed. Added ${addedClasses} new recurring classes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
