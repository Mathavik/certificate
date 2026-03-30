import { Request, Response } from 'express';
import CertificateRecord from '../models/CertificateRecord';

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const { name, college, generatedDate } = req.body;

    if (!name || !college) {
      return res.status(400).json({ error: 'Name and college are required.' });
    }

    const certificate = await CertificateRecord.create({
      name,
      college,
      generatedDate: generatedDate ? new Date(generatedDate) : new Date(),
    });

    return res.status(201).json(certificate);
  } catch (error) {
    console.error('Error saving certificate record:', error);
    return res.status(500).json({ error: 'Unable to save certificate record.' });
  }
};

export const getCertificates = async (_req: Request, res: Response) => {
  try {
    const certificates = await CertificateRecord.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json(certificates);
  } catch (error) {
    console.error('Error fetching certificate records:', error);
    return res.status(500).json({ error: 'Unable to fetch certificate records.' });
  }
};
