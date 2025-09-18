import express from 'express'
import { DashboardController } from './dashboard.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.use(auth(USER_ROLES.ADMIN))
// Dashboard page route
router.get('/', DashboardController.getDashboardPage)

// API routes for dashboard data
router.get('/data', DashboardController.getDashboardData)
router.get('/stats', DashboardController.getDashboardStats)
router.get('/engagement', DashboardController.getUserEngagement)

export const DashboardRoutes = router
