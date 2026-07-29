import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeRoomPhoto } from '../services/geminiService';
import { generateMakeoverImage } from '../services/imageGenService';
import { MakeoverRequest } from '../types/room';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/analyze-room', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      // Return structured fallback analysis if no file provided
      const fallback = await analyzeRoomPhoto(Buffer.from(''), 'image/jpeg');
      return res.json(fallback);
    }
    const result = await analyzeRoomPhoto(file.buffer, file.mimetype);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to analyze room photo' });
  }
});

router.post('/generate-makeover', upload.single('image'), async (req: Request, res: Response) => {
  try {
    let payload: MakeoverRequest;
    if (typeof req.body.payload === 'string') {
      payload = JSON.parse(req.body.payload);
    } else {
      payload = req.body;
    }

    const file = req.file;
    const result = await generateMakeoverImage(payload, file?.buffer);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate makeover' });
  }
});

export default router;
