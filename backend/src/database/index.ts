import prisma from '../config/db';

export const connectDatabase = async () => {
  await prisma.$connect();
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export default prisma;
