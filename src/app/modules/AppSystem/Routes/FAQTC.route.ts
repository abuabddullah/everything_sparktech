import express from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../User/user.constant';
import { FAQTCControllers } from '../Controllers/FAQTC.controller';

const router = express.Router();

router.post('/faq', auth(USER_ROLE.admin), FAQTCControllers.createFAQ);

router.post(
  '/report',
  auth(USER_ROLE.admin, USER_ROLE.investor),//socket
  FAQTCControllers.reportProblem,
);

router.post('/tac', auth(USER_ROLE.admin), FAQTCControllers.createTAC);

router.get('/report', auth(USER_ROLE.admin), FAQTCControllers.getReports);

router.get(
  '/tac',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTCControllers.getTAC,
);

router.get(
  '/faq',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTCControllers.getFAQ,
);

router.patch(
  '/report/:id',
  auth(USER_ROLE.admin, USER_ROLE.investor),
  FAQTCControllers.updateReport,
);

router.patch('/faq/:id', auth(USER_ROLE.admin), FAQTCControllers.updateFAQ);

router.patch('/tac/:id', auth(USER_ROLE.admin), FAQTCControllers.updateTAC);

router.delete('/tac/:id', auth(USER_ROLE.admin), FAQTCControllers.deleteTAC);

router.delete(
  '/report/:id',
  auth(USER_ROLE.admin),
  FAQTCControllers.deleteReport,
);

router.delete('/faq/:id', auth(USER_ROLE.admin), FAQTCControllers.deleteFAQ);

export const FAQTCRoutes = router;
