import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateChatRequest } from '../middleware/validation';
import genAIService from '../services/genai';
import ttsService from '../services/tts';
import { ChatRequest, ChatResponse } from '../types';

const router = Router();

// Main chat endpoint
router.post('/', validateChatRequest, asyncHandler(async (req, res) => {
  const chatRequest: ChatRequest = req.body;
  
  // Generate AI response
  const aiResponse = await genAIService.generateResponse(chatRequest);
  
  let response: ChatResponse = {
    response: aiResponse.response,
    timestamp: aiResponse.timestamp
  };

  // Generate TTS if requested
  if (chatRequest.include_tts && chatRequest.voice_settings) {
    try {
      const ttsResponse = await ttsService.synthesizeSpeech({
        text: aiResponse.response,
        language: chatRequest.voice_settings.language,
        voice: chatRequest.voice_settings.voice,
        speed: chatRequest.voice_settings.speed
      });
      response.audio_url = ttsResponse.audio_url;
    } catch (error) {
      console.warn('TTS generation failed:', error);
      // Don't fail the entire request if TTS fails
    }
  }

  res.json(response);
}));

// Streaming chat endpoint
router.post('/stream', validateChatRequest, asyncHandler(async (req, res) => {
  const chatRequest: ChatRequest = req.body;
  
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  try {
    const streamIterator = await genAIService.generateStreamResponse(chatRequest);
    
    for await (const chunk of streamIterator) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
  }
  
  res.end();
}));

// Health check for AI service
router.get('/health', asyncHandler(async (req, res) => {
  const isAvailable = await genAIService.isModelAvailable();
  
  res.json({
    status: isAvailable ? 'healthy' : 'unhealthy',
    service: 'generative-ai',
    timestamp: new Date()
  });
}));

export default router;