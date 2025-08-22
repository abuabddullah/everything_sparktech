import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateTTSRequest } from '../middleware/validation';
import ttsService from '../services/tts';
import { TTSRequest } from '../types';

const router = Router();

// Text-to-speech synthesis
router.post('/synthesize', validateTTSRequest, asyncHandler(async (req, res) => {
  const ttsRequest: TTSRequest = req.body;
  
  const result = await ttsService.synthesizeSpeech(ttsRequest);
  
  res.json(result);
}));

// Get available voices
router.get('/voices', asyncHandler(async (req, res) => {
  const { language } = req.query;
  
  const voices = await ttsService.getAvailableVoices(language as string);
  
  res.json({
    voices,
    total: voices.length
  });
}));

// Get voices for specific language
router.get('/voices/:languageCode', asyncHandler(async (req, res) => {
  const { languageCode } = req.params;
  
  const voices = await ttsService.getAvailableVoices(languageCode);
  
  res.json({
    voices,
    language: languageCode,
    total: voices.length
  });
}));

export default router;