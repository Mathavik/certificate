import { Request, Response } from 'express';
import { Op } from 'sequelize';
import CertificateRecord from '../models/CertificateRecord';

// ✅ Define Types
type ValidRecord = {
  name: string;
  college: string;
  generatedDate: Date;
};

type BulkRecord = {
  name?: unknown;
  college?: unknown;
  generatedDate?: unknown;
};

type CreateCertificateBody = {
  records?: unknown;
  name?: unknown;
  college?: unknown;
  generatedDate?: unknown;
};

// ✅ Create Certificate (Single + Bulk)
export const createCertificate = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateCertificateBody;

    // ✅ BULK INSERT (Excel upload)
    if (Array.isArray(payload.records)) {
      const rawRecords = payload.records as BulkRecord[];
      const validRecords: ValidRecord[] = rawRecords
        .map((record: BulkRecord): ValidRecord => ({
          name: String(record.name ?? '').trim(),
          college: String(record.college ?? '').trim(),
          generatedDate: record.generatedDate
            ? new Date(String(record.generatedDate))
            : new Date(),
        }))
        .filter((record: ValidRecord) => record.name && record.college);

      if (!validRecords.length) {
        return res.status(400).json({ error: 'No valid records provided.' });
      }

      const certificates = await CertificateRecord.bulkCreate(validRecords);
      return res.status(201).json(certificates);
    }

    // ✅ SINGLE INSERT
    const { name, college, generatedDate } = payload;

    if (!name || !college) {
      return res.status(400).json({ error: 'Name and college are required.' });
    }

    const certificate = await CertificateRecord.create({
      name: String(name).trim(),
      college: String(college).trim(),
      generatedDate: generatedDate
        ? new Date(String(generatedDate))
        : new Date(),
    });

    return res.status(201).json(certificate);
  } catch (error) {
    console.error('Error saving certificate record:', error);
    return res.status(500).json({ error: 'Unable to save certificate record.' });
  }
};

// ✅ GET Certificates (Filter by College)
export const getCertificates = async (req: Request, res: Response) => {
  try {
    const college = String(req.query.college ?? '').trim();

    const where = college
      ? {
          college: {
            [Op.like]: `%${college}%`, // ✅ partial match
          },
        }
      : undefined;

    const certificates = await CertificateRecord.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(certificates);
  } catch (error) {
    console.error('Error fetching certificate records:', error);
    return res.status(500).json({ error: 'Unable to fetch certificate records.' });
  }
};