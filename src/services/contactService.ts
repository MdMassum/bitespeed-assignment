import prisma from '../config/prisma'

// find contacts by phone or email
export const findContacts = async (email?: string, phoneNumber?: string) => {
  return prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined },
      ],
    },
  });
};


// create contact -->
export const createContact = async (email?: string, phoneNumber?: string, linkedId?: number, linkPrecedence: string = "primary") => {
  return prisma.contact.create({
    data: { email, phoneNumber, linkedId, linkPrecedence },
  });
};


// update existing contact -->
export const updateContact = async (contactIds: number[], linkedId: number) => {
  return prisma.contact.updateMany({
    where: { id: { in: contactIds } },
    data: { linkedId, linkPrecedence: "secondary" },
  });
};
