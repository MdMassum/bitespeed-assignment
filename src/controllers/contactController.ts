import { Request, Response } from 'express';
import { findContacts, createContact } from '../services/contactService';
import prisma from '../config/prisma';


export const identifyContact =  async (req: Request, res: Response) => {
    const { email, phoneNumber } = req.body;
  
    try {

      if (!email && !phoneNumber) {
        res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
        return;
      }
  
      // Finding existing contacts that match email or phoneNumber
      const matchedContacts = await findContacts(email, phoneNumber);
  
      if (matchedContacts.length === 0) {

        // Create a new primary contact
        const newContact = await createContact(email, phoneNumber)
  
        res.status(200).json({
            "data" : newContact
        });
        return;
      } else {

        // Collecting primary contacts of matchedContacts
        const primaryIds = new Set<number>();

        for (const contact of matchedContacts) {
          let primaryId: number;
          if (contact.linkPrecedence === 'primary') {
            primaryId = contact.id;
          } else {
            primaryId = contact.linkedId!;
          }
          primaryIds.add(primaryId);
        }
  
        // Fetch all primary contacts sorted by creation time
        const primaryContacts = await prisma.contact.findMany({
          where: {
            id: { in: Array.from(primaryIds) },
            linkPrecedence: 'primary',
          },
          orderBy: { createdAt: 'asc' },
        });
  
        if (primaryContacts.length === 0) {
          res.status(500).json({ error: 'Unexpected error: no primary contacts found' });
          return;
        }
  
        const oldestPrimary = primaryContacts[0];
        const otherPrimaries = primaryContacts.slice(1);
  
        // Merging other primary contacts into the oldest one
        if (otherPrimaries.length > 0) {
          const oldPrimaryIds = otherPrimaries.map((p:any) => p.id);
  
          // Update other primary contacts to secondary
          await prisma.contact.updateMany({
            where: { id: { in: oldPrimaryIds } },
            data: {
              linkedId: oldestPrimary.id,
              linkPrecedence: 'secondary',
              updatedAt: new Date(),
            },
          });
  
          // Updating all contacts linked to old primaries to point to the oldest primary
          await prisma.contact.updateMany({
            where: { linkedId: { in: oldPrimaryIds } },
            data: {
              linkedId: oldestPrimary.id,
              updatedAt: new Date(),
            },
          });
        }
  
        // Checking if new secondary contact is needed
        const mergedClusterContacts = await prisma.contact.findMany({
          where: {
            OR: [
              { id: oldestPrimary.id },
              { linkedId: oldestPrimary.id },
            ],
          },
        });
  
        const existingEmails = new Set<string>();
        const existingPhones = new Set<string>();

        mergedClusterContacts.forEach((contact:any) => {
          if (contact.email) existingEmails.add(contact.email);
          if (contact.phoneNumber) existingPhones.add(contact.phoneNumber);
        });
  
        let needToCreateSecondary = false;
        if (email && !existingEmails.has(email)) needToCreateSecondary = true;
        if (phoneNumber && !existingPhones.has(phoneNumber)) needToCreateSecondary = true;
  
        if (needToCreateSecondary) {
          await prisma.contact.create({
            data: {
              email: email || null,
              phoneNumber: phoneNumber || null,
              linkedId: oldestPrimary.id,
              linkPrecedence: 'secondary',
            },
          });
        }
  
        // Fetch updated merged cluster to build response
        const updatedMergedCluster = await prisma.contact.findMany({
          where: {
            OR: [
              { id: oldestPrimary.id },
              { linkedId: oldestPrimary.id },
            ],
          },
          orderBy: { createdAt: 'asc' },
        });
  
        const emails: string[] = [];
        const emailsSet = new Set<string>();
        const phoneNumbers: string[] = [];
        const phoneNumbersSet = new Set<string>();
  
        updatedMergedCluster.forEach((contact:any) => {
          if (contact.email && !emailsSet.has(contact.email)) {
            emails.push(contact.email);
            emailsSet.add(contact.email);
          }
          if (contact.phoneNumber && !phoneNumbersSet.has(contact.phoneNumber)) {
            phoneNumbers.push(contact.phoneNumber);
            phoneNumbersSet.add(contact.phoneNumber);
          }
        });
  
        const secondaryContactIds = updatedMergedCluster
          .filter((c:any) => c.id !== oldestPrimary.id)
          .map((c:any) => c.id);
  
        res.status(200).json({
          contact: {
            primaryContactId: oldestPrimary.id,
            emails,
            phoneNumbers,
            secondaryContactIds,
          },
        });
        return;
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // GET /contacts endpoint
export const getAllContacts =  async (req: Request, res: Response) => {
  try {
    
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'asc' },
    });


    res.status(200).json({ contacts });
    return;

  } catch (error) {

    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
    
  }
};