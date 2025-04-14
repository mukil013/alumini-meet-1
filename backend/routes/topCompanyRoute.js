const express = require("express");
const router = express.Router();
const companyController = require("../controller/topCompaniesController");

router.get("/", companyController.getCompany);
router.post("/", companyController.addCompany);
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

router.post("/:companyId/alumni", companyController.addRemarks);
router.put("/:companyId/alumni/:userId", companyController.updateRemarks);
router.delete("/:companyId/alumni/:userId", companyController.deleteRemarks);
router.delete("/:companyId/admin-delete/:Id", companyController.deleteRemarksAdmin)

module.exports = router;