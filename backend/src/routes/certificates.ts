import { Router } from 'express';
import { createCertificate, getCertificates } from '../controllers/certificateController';

const router = Router();

router.post('/', createCertificate);
router.get('/', getCertificates);

export default router;
