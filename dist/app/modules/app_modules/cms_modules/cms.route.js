"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cms_controller_1 = require("./cms.controller");
const express = require('express');
const router = express.Router();
// Create
router.post('/company-overview', cms_controller_1.CmsController.createCompanyOverview);
// Read
router.get('/company-overview', cms_controller_1.CmsController.getCompanyOverview);
// Update
router.put('/company-overview', cms_controller_1.CmsController.updateCompanyOverview);
// Delete
router.delete('/company-overview', cms_controller_1.CmsController.deleteCompanyOverview);
// Add FAQ
router.post('/company-overview/faq', cms_controller_1.CmsController.addFAQ);
// Edit FAQ
router.put('/company-overview/faq', cms_controller_1.CmsController.editFAQ);
// Delete FAQ
router.delete('/company-overview/faq', cms_controller_1.CmsController.deleteFAQ);
// Add logo
// router.post('/company-overview/logo', CmsController.addLogo);
// Edit logo
// router.put('/company-overview/logo', CmsController.editLogo);
module.exports = router;
