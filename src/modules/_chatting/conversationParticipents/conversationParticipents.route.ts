import express from 'express';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import { ConversationParticipentsController } from './conversationParticipents.controller';
import { IConversationParticipents } from './conversationParticipents.interface';
import auth from '../../../middlewares/auth';

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

export const optionValidationChecking = <T extends keyof IConversationParticipents | 'sortBy' | 'page' | 'limit' | 'populate'>(filters: T[]) => {
  return filters;
};

// const taskService = new TaskService();
const controller = new ConversationParticipentsController();

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

//info : pagination route must be before the route with params
router.route('/paginate').get(
  //auth('common'),
  validateFiltersForQuery(optionValidationChecking(['_id', 'userId', ...paginationOptions])),
  controller.getAllWithPagination 
);

/**********
 * 
 * (req.query.otherUserId) otherUserId
 * get conversation participents by conversationId
 * 
 * ********* */
router.route('/check-conversation').get(
  auth('common'),
  controller.hasConversationWithUser
);

router.route('/:id').get(
  // auth('common'),
  controller.getById 
);

router.route('/update/:id').put(
  //auth('common'), // FIXME: Change to admin
  // validateRequest(UserValidation.createUserValidationSchema),
  controller.updateById
);

router.route('/').get(
  //auth('common'), // FIXME: maybe authentication lagbe na .. 
  controller.getAll 
);

router.route('/create').post(
  // [
  //   upload.fields([
  //     { name: 'attachments', maxCount: 15 }, // Allow up to 5 cover photos
  //   ]),
  // ],
  //auth('common'),
  // validateRequest(UserValidation.createUserValidationSchema),
  controller.create
);

router
  .route('/delete/:id')
  .delete(
    //auth('common'),
    controller.deleteById); // FIXME : change to admin

router
.route('/softDelete/:id')
.put(
  //auth('common'),
  controller.softDeleteById);


export const ConversationParticipentsRoute = router;
