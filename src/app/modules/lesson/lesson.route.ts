import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import validateRequest from '../../middleware/validateRequest'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import { S3Helper } from '../../../helpers/image/s3helper'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { LessonQuestionSchema, LessonSchema } from './lesson.validation'
import { LessonControllers } from '../lesson/lesson.controller'
import { ExamControllers } from '../exam/exam.controller'
import { QuestionSchema } from '../exam/exam.validation'

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
  validateRequest(LessonQuestionSchema),

  (req, res, next) => {
    const payload = req.body

    req.body = payload.questions
    next()
  },

  ExamControllers.createQuestion,
)

// --------------------
// Lessons routes
// --------------------
router
  .route('/')
  .get(auth(USER_ROLES.ADMIN), LessonControllers.getAllLessons)
  .post(
    auth(USER_ROLES.ADMIN),
    validateRequest(LessonSchema),

    LessonControllers.createLesson,
  )

router
  .route('/next_gen')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    LessonControllers.getNextGenLesson,
  )
router
  .route('/case_study')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    LessonControllers.getCaseStudyLesson,
  )

router
  .route('/:id')
  .get(auth(USER_ROLES.ADMIN), LessonControllers.getSingleLesson)
  .delete(auth(USER_ROLES.ADMIN), LessonControllers.deleteLesson)

router
  .route('/:lessonId/questions')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    LessonControllers.getQuestionByLesson,
  )

export const LessonRoutes = router
