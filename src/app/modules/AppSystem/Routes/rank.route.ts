import express from 'express';
import { RankControllers } from '../Controllers/rank.controller';

const router = express.Router();

router.get('/', RankControllers.getUsersByRank);

router.get('/raised', RankControllers.getUsersByRaisedRank);

export const RankRoutes = router;
