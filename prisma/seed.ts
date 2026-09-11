import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ids = {
  team: '10000000-0000-4000-8000-000000000001',
  admin: '20000000-0000-4000-8000-000000000001',
  memberOne: '20000000-0000-4000-8000-000000000002',
  memberTwo: '20000000-0000-4000-8000-000000000003',
  makeCoffee: '30000000-0000-4000-8000-000000000001',
  buyCoffee: '30000000-0000-4000-8000-000000000002',
  event: '40000000-0000-4000-8000-000000000001',
  request: '50000000-0000-4000-8000-000000000001',
} as const;

const profiles = [
  {
    id: ids.admin,
    email: 'admin@cafedavez.local',
    displayName: 'Admin do Café',
  },
  {
    id: ids.memberOne,
    email: 'ana@cafedavez.local',
    displayName: 'Ana Café',
  },
  {
    id: ids.memberTwo,
    email: 'bruno@cafedavez.local',
    displayName: 'Bruno Café',
  },
] as const;

async function main() {
  for (const profile of profiles) {
    await prisma.profile.upsert({
      where: { id: profile.id },
      update: {
        email: profile.email,
        displayName: profile.displayName,
      },
      create: profile,
    });
  }

  await prisma.team.upsert({
    where: { id: ids.team },
    update: { name: 'Time Café da Vez' },
    create: { id: ids.team, name: 'Time Café da Vez' },
  });

  for (let index = 0; index < profiles.length; index += 1) {
    const profile = profiles[index];
    await prisma.allowedEmail.upsert({
      where: {
        teamId_email: { teamId: ids.team, email: profile.email },
      },
      update: { role: index === 0 ? 'ADMIN' : 'MEMBER' },
      create: {
        teamId: ids.team,
        email: profile.email,
        role: index === 0 ? 'ADMIN' : 'MEMBER',
      },
    });

    await prisma.teamMember.upsert({
      where: {
        teamId_profileId: { teamId: ids.team, profileId: profile.id },
      },
      update: {
        role: index === 0 ? 'ADMIN' : 'MEMBER',
        status: 'ACTIVE',
      },
      create: {
        teamId: ids.team,
        profileId: profile.id,
        role: index === 0 ? 'ADMIN' : 'MEMBER',
      },
    });
  }

  const rotations = [
    {
      id: ids.makeCoffee,
      type: 'MAKE_COFFEE' as const,
      name: 'Fazer o café',
    },
    {
      id: ids.buyCoffee,
      type: 'BUY_COFFEE' as const,
      name: 'Comprar o café',
    },
  ];

  for (const rotation of rotations) {
    await prisma.rotation.upsert({
      where: { id: rotation.id },
      update: { name: rotation.name },
      create: {
        id: rotation.id,
        teamId: ids.team,
        type: rotation.type,
        name: rotation.name,
      },
    });

    for (let position = 0; position < profiles.length; position += 1) {
      const profile = profiles[position];
      await prisma.rotationMember.upsert({
        where: {
          rotationId_profileId: {
            rotationId: rotation.id,
            profileId: profile.id,
          },
        },
        update: { active: true, position },
        create: {
          rotationId: rotation.id,
          profileId: profile.id,
          position,
        },
      });
    }
  }

  await prisma.turnEvent.upsert({
    where: { requestId: ids.request },
    update: {},
    create: {
      id: ids.event,
      rotationId: ids.makeCoffee,
      subjectId: ids.admin,
      subjectName: 'Admin do Café',
      action: 'COMPLETED',
      requestId: ids.request,
      performedById: ids.admin,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
