import express from 'express';
import { ExaminationController } from './Examination.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { ExaminationValidation } from './Examination.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE),
    validateRequest(ExaminationValidation.createExaminationZodSchema), ExaminationController.createExamination);

router.get('/', ExaminationController.getAllExaminations);

router.get('/unpaginated', ExaminationController.getAllUnpaginatedExaminations);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ExaminationController.hardDeleteExamination);

router.patch('/:id', fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ExaminationValidation.updateExaminationZodSchema), ExaminationController.updateExamination);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ExaminationController.deleteExamination);

router.get('/:id', ExaminationController.getExaminationById);

export const ExaminationRoutes = router;
