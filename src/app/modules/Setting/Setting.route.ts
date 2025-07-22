import express from 'express';
import { SettingController } from './Setting.controller';

const router = express.Router();

router.get('/delete-steps', SettingController.getDeleteSteps);

export const SettingRoutes = router;
