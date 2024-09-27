

const express = require('express')
const { loginEmployee } = require('../controllers/loginController')
const {verifyAll} = require('../middleware/rbacMiddleware');
const loginRoute = express.Router()

loginRoute.post('/login', loginEmployee)

module.exports = loginRoute 