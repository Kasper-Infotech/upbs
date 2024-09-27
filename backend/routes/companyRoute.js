const express = require('express');
const companyRoute = express.Router();

// const companyController = require('../controllers/companyController');
const {verifyAdminHRManager,verifyAdminHR} = require('../middleware/rbacMiddleware');


const { getAllCompanyDetails, createCompany, updateCompanyDtails,deleteCompanyDetails } = require('../controllers/compnayController');

// verifyHR
// GET: Retrieve all company
companyRoute.get("/company", getAllCompanyDetails);

// POST: Create a new company
companyRoute.post("/company", createCompany);

// PUT: Update an existing company
companyRoute.put("/company/:id", updateCompanyDtails);

companyRoute.delete("/company/:id",deleteCompanyDetails )

module.exports = companyRoute;