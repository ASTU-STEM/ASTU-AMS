const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.event.count();
  console.log('Current DB event count:', count);
  
  const seedEvents = [
    {
      title: 'ASTU Alumni Career Summit',
      description: 'Annual gathering of ASTU graduates, corporate recruiters, and keynote speakers.',
      date: new Date('2026-06-12'),
      location: 'Main Auditorium',
      type: 'Event',
      createdBy: 'system'
    },
    {
      title: 'Cloud Computing Bootcamp',
      description: 'Hands-on training on AWS, Azure, and cloud infrastructure for ASTU engineering seniors.',
      date: new Date('2026-06-18'),
      location: 'CS Lab 101',
      type: 'Workshop',
      createdBy: 'system'
    },
    {
      title: 'Employer Roundtable',
      description: 'Executive panel discussing graduate tracer study trends and skill alignment.',
      date: new Date('2026-06-26'),
      location: 'Conference Hall A',
      type: 'Event',
      createdBy: 'system'
    },
    {
      title: 'CV and Interview Lab',
      description: 'Interactive resume critique and mock interviews conducted by industry HR leads.',
      date: new Date('2026-05-20'),
      location: 'Career Center',
      type: 'Workshop',
      createdBy: 'system'
    },
    {
      title: 'AI/ML Research Symposium',
      description: 'Presentation of faculty and alumni research projects in machine learning.',
      date: new Date('2026-07-05'),
      location: 'Engineering Complex',
      type: 'Event',
      createdBy: 'system'
    },
    {
      title: 'Grant Writing Workshop',
      description: 'Masterclass on submitting competitive international research grant proposals.',
      date: new Date('2026-06-28'),
      location: 'Room 305',
      type: 'Workshop',
      createdBy: 'system'
    }
  ];

  if (count === 0) {
    for (const ev of seedEvents) {
      await prisma.event.create({ data: ev });
    }
    console.log('Successfully seeded 6 real events into Postgres DB!');
  } else {
    console.log(`Database already has ${count} events.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
