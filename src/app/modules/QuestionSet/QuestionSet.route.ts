import express from 'express';
import { QuestionSetController } from './QuestionSet.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { QuestionSetValidation } from './QuestionSet.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE),
    validateRequest(QuestionSetValidation.createQuestionSetZodSchema), QuestionSetController.createQuestionSet);

router.get('/', QuestionSetController.getAllQuestionSets);

router.get('/unpaginated', QuestionSetController.getAllUnpaginatedQuestionSets);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), QuestionSetController.hardDeleteQuestionSet);

router.patch('/:id', fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(QuestionSetValidation.updateQuestionSetZodSchema), QuestionSetController.updateQuestionSet);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), QuestionSetController.deleteQuestionSet);

router.get('/:id', QuestionSetController.getQuestionSetById);

export const QuestionSetRoutes = router;
