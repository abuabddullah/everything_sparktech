import express from 'express';
import { QuestionController } from './Question.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { QuestionValidation } from './Question.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE),
    validateRequest(QuestionValidation.createQuestionZodSchema), QuestionController.createQuestion);

router.get('/', QuestionController.getAllQuestions);

router.get('/unpaginated', QuestionController.getAllUnpaginatedQuestions);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), QuestionController.hardDeleteQuestion);

router.patch('/:id', fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(QuestionValidation.updateQuestionZodSchema), QuestionController.updateQuestion);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), QuestionController.deleteQuestion);

router.get('/:id', QuestionController.getQuestionById);

export const QuestionRoutes = router;
