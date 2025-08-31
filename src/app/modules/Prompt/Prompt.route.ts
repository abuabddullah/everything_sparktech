import express from 'express'
import { PromptController } from './Prompt.controller'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { PromptValidation } from './Prompt.validation'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import parseFileData from '../../middleware/parseFileData'
import { FOLDER_NAMES } from '../../../enums/files'

const router = express.Router()

router.post(
  '/',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  parseFileData(FOLDER_NAMES.IMAGE),
  validateRequest(PromptValidation.createPromptZodSchema),
  PromptController.createPrompt,
)

router.get('/', PromptController.getAllPrompts)

router.get('/unpaginated', PromptController.getAllUnpaginatedPrompts)

router.delete(
  '/hard-delete/:id',
  auth(USER_ROLES.ADMIN),
  PromptController.hardDeletePrompt,
)

router.patch(
  '/:id',
  fileUploadHandler(),
  parseFileData(FOLDER_NAMES.IMAGE),
  auth(USER_ROLES.ADMIN),
  validateRequest(PromptValidation.updatePromptZodSchema),
  PromptController.updatePrompt,
)

router.delete('/:id', auth(USER_ROLES.ADMIN), PromptController.deletePrompt)

router.get('/:id', PromptController.getPromptById)

export const PromptRoutes = router
