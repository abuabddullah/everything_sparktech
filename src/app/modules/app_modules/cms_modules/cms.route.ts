
import express, { NextFunction, Request, Response } from "express";
import { CmsController } from "./cms.controller";
import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";
import fileUploadHandler from "../../../middlewares/fileUploadHandler";
import validateRequest from "../../../middlewares/validateRequest";
import { CompanyOverviewValildtionSchema } from "./cms.validation";

const router = express.Router();

// Company Overview CRUD
router.get('/', CmsController.getCompanyOverview);
router.patch('/', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), fileUploadHandler(), (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
        req.body = req.body.data
    }
    // Proceed to controller
    return CmsController.updateCompanyOverview(req, res, next);
});
router.patch('/terms-conditions', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), CmsController.updateTermsConditions);
router.patch('/privacy-policy', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), CmsController.updatePrivacyPolicy); 

// FAQ CRUD
router.get('/faq', CmsController.getAllFAQ);
router.post('/faq', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), CmsController.addFAQ);
router.patch('/faq/:faqId', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), CmsController.editFAQ);
router.delete('/faq/:faqId', auth(USER_ROLES.SUPER_ADMIN), CmsController.deleteFAQ);

// Contact CRUD
router.get('/contact', CmsController.getContact);
router.patch('/contact', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN),validateRequest(CompanyOverviewValildtionSchema.updateContactShcema), CmsController.updateContact);

// Logo CRUD
router.get('/logo', CmsController.getLogo);
router.patch('/logo', auth(USER_ROLES.ADMIN,USER_ROLES.MANAGER, USER_ROLES.SUPER_ADMIN), fileUploadHandler(), CmsController.updateLogo);

export const companyCMSRoutes = router;
