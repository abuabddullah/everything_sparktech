import express from 'express'
import { StudymaterialController } from './studymaterial.controller'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import {
  createStudymaterialSchema,
  updateStudymaterialSchema,
} from './studymaterial.validation'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { S3Helper } from '../../../helpers/image/s3helper'
import { StudyMaterialCategory } from '../../../enum/studyMaterial'

const router = express.Router()

router.get(
  '/',
  // auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudymaterialController.getAllStudymaterials,
)

router.get(
  '/study-guide',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudymaterialController.getAllStudyGuides,
)

router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  StudymaterialController.getSingleStudymaterial,
)

router.post(
  '/',
  auth(USER_ROLES.ADMIN),

  fileUploadHandler(),

  async (req, res, next) => {
    const payload = req.body
    try {
      if (payload.category !== StudyMaterialCategory.QUESTION_SAMPLE) {
        const docFiles = (req.files as any).document as Express.Multer.File[]
        if (!docFiles || docFiles.length == 0) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'No document file provided3',
          )
        }

        // Take the first file only
        const docFile = docFiles[0]

        // Upload single doc to S3
        const uploadedDocUrl = await S3Helper.uploadToS3(docFile, 'pdf')

        if (!uploadedDocUrl) {
          throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to upload document3',
          )
        }
        req.body = {
          fileUrl: uploadedDocUrl,
          ...payload,
        }
      }
      next()
    } catch (error) {
      console.log({ error })
      res.status(400).json({ message: 'Failed to upload doc4' })
    }
  },

  validateRequest(createStudymaterialSchema),

  StudymaterialController.createStudymaterial,
)

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN),
  StudymaterialController.deleteStudymaterial,
)
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),

  fileUploadHandler(),

  async (req, res, next) => {
    const payload = req.body
    try {
      if (payload.category !== StudyMaterialCategory.QUESTION_SAMPLE) {
        const docFiles = (req.files as any).document as Express.Multer.File[]
        if (!docFiles || docFiles.length == 0) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'No document file provided3',
          )
        }

        // Take the first file only
        const docFile = docFiles[0]

        // Upload single doc to S3
        const uploadedDocUrl = await S3Helper.uploadToS3(docFile, 'pdf')

        if (!uploadedDocUrl) {
          throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to upload document3',
          )
        }
        req.body = {
          fileUrl: uploadedDocUrl,
          ...payload,
        }
      }
      next()
    } catch (error) {
      console.log({ error })
      res.status(400).json({ message: 'Failed to upload doc4' })
    }
  },

  validateRequest(updateStudymaterialSchema),
  StudymaterialController.updateStudymaterial,
)

export const StudymaterialRoutes = router
