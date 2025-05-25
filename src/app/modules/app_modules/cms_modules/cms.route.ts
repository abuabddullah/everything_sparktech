import { CmsController } from "./cms.controller";

const express = require('express');
const router = express.Router();

// Create
router.post('/company-overview', CmsController.createCompanyOverview);

// Read
router.get('/company-overview', CmsController.getCompanyOverview);

// Update
router.put('/company-overview', CmsController.updateCompanyOverview);

// Delete
router.delete('/company-overview', CmsController.deleteCompanyOverview);

// Add FAQ
router.post('/company-overview/faq', CmsController.addFAQ);

// Edit FAQ
router.put('/company-overview/faq', CmsController.editFAQ);

// Delete FAQ
router.delete('/company-overview/faq', CmsController.deleteFAQ);
// Add logo
router.post('/company-overview/logo', CmsController.addLogo);

// Edit logo
router.put('/company-overview/logo', CmsController.editLogo);

module.exports = router;
