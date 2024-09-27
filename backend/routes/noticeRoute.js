const express = require('express')
const { NoticeBoard } = require('../controllers/noticeController.js')
const {verifyAll} = require('../middleware/rbacMiddleware');
const noticeRoute = express.Router()

noticeRoute.get('/notice/:id',NoticeBoard)

module.exports = noticeRoute 