import express from 'express';
import { StudyLessonController } from './StudyLesson.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { StudyLessonValidation } from './StudyLesson.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE),
    validateRequest(StudyLessonValidation.createStudyLessonZodSchema), StudyLessonController.createStudyLesson);

router.get('/', StudyLessonController.getAllStudyLessons);

router.get('/unpaginated', StudyLessonController.getAllUnpaginatedStudyLessons);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), StudyLessonController.hardDeleteStudyLesson);

router.patch('/:id', fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(StudyLessonValidation.updateStudyLessonZodSchema), StudyLessonController.updateStudyLesson);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), StudyLessonController.deleteStudyLesson);

router.get('/:id', StudyLessonController.getStudyLessonById);

export const StudyLessonRoutes = router;
