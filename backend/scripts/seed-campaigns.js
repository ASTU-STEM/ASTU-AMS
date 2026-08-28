const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campaigns = [
    { title: 'ASTU Scholarship Fund 2026', description: 'Support underprivileged engineering students with full tuition scholarships.', goal: 5000000, raised: 1850000, category: 'Scholarship', donorCount: 347, status: 'ACTIVE' },
    { title: 'AI Research Lab Equipment', description: 'Fund cutting-edge GPU servers for the new AI research laboratory.', goal: 8000000, raised: 3200000, category: 'Research', donorCount: 156, status: 'ACTIVE' },
    { title: 'Campus Innovation Hub', description: 'Build a modern co-working makerspace and innovation center for students.', goal: 12000000, raised: 5400000, category: 'Infrastructure', donorCount: 289, status: 'ACTIVE' },
  ];

  for (const campaign of campaigns) {
    const existing = await prisma.donationCampaign.findFirst({ where: { title: campaign.title } });
    if (!existing) {
      await prisma.donationCampaign.create({ data: campaign });
      console.log(`Created campaign: ${campaign.title}`);
    } else {
      console.log(`Campaign already exists: ${campaign.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
