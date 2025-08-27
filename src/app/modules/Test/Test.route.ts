import express from 'express';
import { TestController } from './Test.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { TestValidation } from './Test.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE),
    validateRequest(TestValidation.createTestZodSchema), TestController.createTest);

router.get('/', TestController.getAllTests);

router.get('/unpaginated', TestController.getAllUnpaginatedTests);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TestController.hardDeleteTest);

router.patch('/:id', fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(TestValidation.updateTestZodSchema), TestController.updateTest);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TestController.deleteTest);

router.get('/:id', TestController.getTestById);

export const TestRoutes = router;
