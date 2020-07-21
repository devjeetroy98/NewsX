var express = require('express');
var authModel = require('../models/authModel');
const authMiddle = require('../middlewares/authMiddle')
const { route } = require('.');
var router = express.Router();

router.route('/register').post(authModel.regisUser).get(authModel.getRegister)
router.route('/login').post(authModel.loginUser).get(authModel.getLogin)
router.route('/cover/:id').post(authMiddle, authModel.getCover);
router.route('/delete/:id').post(authMiddle, authModel.deleteUser)
router.route('/logout/:id').post(authMiddle, authModel.logoutFunc)

module.exports = router