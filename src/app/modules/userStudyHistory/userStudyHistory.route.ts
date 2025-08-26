import express from 'express'
import { UserStudyHistoryController } from './userStudyHistory.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { UserStudyHistoryValidation } from './userStudyHistory.validation'

const router = express.Router()

// Record lesson question attempt
router.post(
  '/lesson/question-attempt',
  auth('student', 'admin'),
  validateRequest(UserStudyHistoryValidation.recordLessonQuestionAttempt),
  UserStudyHistoryController.recordLessonQuestionAttempt,
)

// Start exam attempt
router.post(
  '/exam/start',
  auth('student', 'admin'),
  validateRequest(UserStudyHistoryValidation.startExamAttempt),
  UserStudyHistoryController.startExamAttempt,
)

// Complete exam attempt
router.post(
  '/exam/complete',
  auth('student', 'admin'),
  validateRequest(UserStudyHistoryValidation.completeExamAttempt),
  UserStudyHistoryController.completeExamAttempt,
)

// Get user's own study history (authenticated user)
router.get(
  '/my-history',
  auth('student', 'admin'),
  UserStudyHistoryController.getMyStudyHistory,
)

// Get user's own lesson progress
router.get(
  '/my-lessons',
  auth('student', 'admin'),
  UserStudyHistoryController.getMyLessonProgress,
)

// Get user's own exam history
router.get(
  '/my-exams',
  auth('student', 'admin'),
  UserStudyHistoryController.getMyExamHistory,
)

// Admin routes - Get all user study histories
router.get(
  '/admin/all',
  auth('admin'),
  UserStudyHistoryController.getAllUserStudyHistories,
)

// Admin routes - Get specific user's study statistics
router.get(
  '/admin/user/:userId/stats',
  auth('admin'),
  UserStudyHistoryController.getUserStudyStats,
)

// Admin routes - Get specific user's lesson progress
router.get(
  '/admin/user/:userId/lessons',
  auth('admin'),
  UserStudyHistoryController.getLessonProgress,
)

// Admin routes - Get specific user's exam history
router.get(
  '/admin/user/:userId/exams',
  auth('admin'),
  UserStudyHistoryController.getExamHistory,
)

// Admin routes - Get specific user's specific lesson progress
router.get(
  '/admin/user/:userId/lesson/:lessonId',
  auth('admin'),
  UserStudyHistoryController.getSpecificLessonProgress,
)

// Admin routes - Get specific user's specific exam history
router.get(
  '/admin/user/:userId/exam/:examId',
  auth('admin'),
  UserStudyHistoryController.getSpecificExamHistory,
)

export const UserStudyHistoryRoutes = router
