const express = require('express');
const router = express.Router();
const User = require('../models/user');
const resetToken = require('../models/resetTokens');
const { route } = require('./campground');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const isLoggedIn = require('../middleware')
const { validateUser,checkUserOwnership } = require('../middleware')
const users = require('../controllers/users')


const multer = require('multer');
const { storage } = require('../cloudinary/index')
const upload = multer({ storage }) 


router.get('/users',catchAsync(users.index))

router.get('/edit', users.renderEdit)

router.post('/users/:id', users.verifyUser)

router.get('/register', users.renderRegister)

router.post('/register', upload.single('image'), validateUser, catchAsync(users.register))

router.get('/changepass', users.renderch)

router.post('/:id/changepass/', users.chpass)

router.get('/forgotpass', users.renderfgpass)

router.post('/forgotpass', users.fgpass)

router.get('/resetfp', users.resetfp)

router.post('/resetfp', users.presetfp)

router.get('/login', users.renderLogin)

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout',users.logout )

module.exports = router;