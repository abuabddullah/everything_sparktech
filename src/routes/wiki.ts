import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateWikiRequest } from '../middleware/validation';
import wikiService from '../services/wiki';
import { WikiSearchRequest } from '../types';

const router = Router();

// Search Wikipedia
router.post('/search', validateWikiRequest, asyncHandler(async (req, res) => {
  const searchRequest: WikiSearchRequest = req.body;
  
  const results = await wikiService.searchWikipedia(searchRequest);
  
  res.json(results);
}));

// Get page summary
router.get('/page/:title/summary', asyncHandler(async (req, res) => {
  const { title } = req.params;
  
  const summary = await wikiService.getPageSummary(decodeURIComponent(title));
  
  res.json(summary);
}));

// Get page content
router.get('/page/:title/content', asyncHandler(async (req, res) => {
  const { title } = req.params;
  const { sections } = req.query;
  
  const sectionsArray = sections 
    ? (sections as string).split(',').map(s => s.trim())
    : undefined;
  
  const content = await wikiService.getPageContent(decodeURIComponent(title), sectionsArray);
  
  res.json({
    title: decodeURIComponent(title),
    content,
    sections: sectionsArray
  });
}));

// Get random article
router.get('/random', asyncHandler(async (req, res) => {
  const randomArticle = await wikiService.getRandomArticle();
  
  res.json(randomArticle);
}));

export default router;