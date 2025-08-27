import express from 'express'
import { ExamControllers } from './exam.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import validateRequest from '../../middleware/validateRequest'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import { S3Helper } from '../../../helpers/image/s3helper'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { ExamSchema, QuestionSchema, StemSchema } from './exam.validation'

const router = express.Router()

// --------------------
// Helper middleware for S3 uploads
// --------------------
const handleStemImageUpload = async (req: any, res: any, next: any) => {
  try {
    const payload = req.body

    if (!payload.stems) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Stems are required'))
    }

    payload.stems = JSON.parse(payload.stems)
    req.body = payload.stems

    const imageFiles = (req.files as any)?.image as Express.Multer.File[]

    if (imageFiles) {
      // Take the first image only
      const imageFile = imageFiles

      // Upload single image to S3
      const uploadedImageUrl = await S3Helper.uploadMultipleFilesToS3(
        imageFile,
        'image',
      )

      if (!uploadedImageUrl) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to upload image',
        )
      }

      // Merge into req.body for Zod validation
      req.body = payload.stems.map((stem: any, index: number) => ({
        ...stem,
        stemPicture: uploadedImageUrl[index] || null, // Get image by index
      }))
    }
  } catch (error) {
    console.error({ error })
    res.status(400).json({ message: 'Failed to upload image' })
  }

  next()
}

// --------------------
// Stems routes
// --------------------
router.route('/stems').post(
  auth(USER_ROLES.ADMIN),

  fileUploadHandler(),

  // validateRequest(StemSchema),
  handleStemImageUpload,
  ExamControllers.createStem,
)

// --------------------
// Questions routes
// --------------------
router.route('/questions').post(
  auth(USER_ROLES.ADMIN),
  validateRequest(QuestionSchema),

  (req, res, next) => {
    const payload = req.body

    req.body = payload.questions
    next()
  },

  ExamControllers.createQuestion,
)

// --------------------
// Exams routes
// --------------------
router.route('/').get(auth(USER_ROLES.ADMIN), ExamControllers.getAllExams).post(
  auth(USER_ROLES.ADMIN),
  validateRequest(ExamSchema),

  ExamControllers.createExam,
)

router
  .route('/readiness')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    ExamControllers.getReadinessExam,
  )
router
  .route('/standalone')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    ExamControllers.getStandaloneExam,
  )

router
  .route('/:id')
  .get(auth(USER_ROLES.ADMIN), ExamControllers.getSingleExam)
  .delete(auth(USER_ROLES.ADMIN), ExamControllers.deleteExam)

router
  .route('/:examId/questions')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    ExamControllers.getQuestionByExam,
  )

export const ExamRoutes = router
