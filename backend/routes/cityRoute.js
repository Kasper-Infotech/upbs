const express = require("express");
const cityRoute = express.Router();

// const cityController = require('../controllers/cityController');
const {verifyAdminHRManager,verifyAdminHR} = require('../middleware/rbacMiddleware');
const {
  getAllcity,
  createCity,
  updateCity,
  deleteCity
} = require("../controllers/cityController");

// GET: Retrieve all countries
// verifyAdminHR
cityRoute.get("/city", verifyAdminHRManager, getAllcity);

// POST: Create a new city
cityRoute.post("/city", createCity);

// PUT: Update an existing city
cityRoute.put("/city/:id",verifyAdminHR, updateCity);

// DELETE: Delete a city
cityRoute.delete("/city/:id",verifyAdminHR, deleteCity);

module.exports = cityRoute;
