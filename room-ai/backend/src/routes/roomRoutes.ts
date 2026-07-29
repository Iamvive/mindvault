import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeRoomPhoto } from '../services/geminiService';
import { generateMakeoverImage } from '../services/imageGenService';
import { MakeoverRequest, ImageInput } from '../types/room';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/analyze-room', upload.array('images', 4), async (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const imageInputs: ImageInput[] = files.map(f => ({
      buffer: f.buffer,
      mimeType: f.mimetype
    }));

    const result = await analyzeRoomPhoto(imageInputs);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to analyze room photos' });
  }
});

router.post('/generate-makeover', upload.array('images', 4), async (req: Request, res: Response) => {
  try {
    let payload: MakeoverRequest;
    if (typeof req.body.payload === 'string') {
      payload = JSON.parse(req.body.payload);
    } else {
      payload = req.body;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const mainBuffer = files.length > 0 ? files[0].buffer : undefined;
    const result = await generateMakeoverImage(payload, mainBuffer);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate makeover' });
  }
});

export default router;
