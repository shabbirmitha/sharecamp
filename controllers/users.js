const User = require('../models/user');
const cloudinary = require('cloudinary');
const { findById } = require('../models/user');
const resetToken = require('../models/resetTokens');
const mailer = require('./sendMail');
const user = require('../models/user');
const crypto = require('crypto');
const { func } = require('joi');
var mongoose=require('mongoose');
var passportLocalMongoose=require("passport-local-mongoose");


module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.renderEdit = (req, res) => {
    res.render('users/edit')
}

module.exports.renderch = (req, res) => {
    res.render('users/changepass')
}

module.exports.renderfgpass = (req,res) => {
    res.render('users/forgotpass')
}

module.exports.verifyUser = (req, res) => {
    const id = req.params.id;
    User.findByIdAndUpdate(id,[{$set:{verify:{$eq:[false,"$verify"]}}}]).then((resp)=>{
        res.redirect(id);
    });
}

module.exports.register = async (req, res, next) => {
    try {
        const { name, email, username, password, about} = req.body.user
        const image = req.file.path
        const user = new User({ name, email, username, about, image});
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {    //doesnt support await , here after account creation you are directly loggged in
            if (err) {
                return next(err)
            }
            req.flash('success', `Welcome to ShareCamp ${user.username}`)
            res.redirect('/campgrounds')
        })
    } catch (error) {
        req.flash('error', error.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.index = async (req, res) => {
    const users = await User.find({});
    res.render('users/index',  { users })
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome back ${req.body.username}!!`)
    const redirectUrl = req.session.returnTo || '/campgrounds' //redirecting them to their page after login redirect
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', `Goodbye :(`);
    res.redirect('/campgrounds');
}


module.exports.chpass = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id);
    User.findByUsername(user.username, (err, user) => {
        if (err) {
            req.flash('error', err.message)
            res.redirect('/changepass')
        } else {
            user.changePassword(req.body.oldpassword, 
            req.body.newpassword, function (err) {
                if (err) {
                    req.flash('error', err.message)
                    res.redirect('/changepass')
                } else {
                    req.flash('success', `Password changed successfully`);
                    res.redirect(`/users/${user._id}`);
                }
            });
        }
    });
 }

 module.exports.fgpass = async (req,res) => {
    const { email } = req.body

    var user = await User.findOne({ email : email });

    if(user){

        var token = crypto.randomBytes(32).toString('hex');
        await resetToken({token: token, email: email }).save();

        mailer.sendResetEmail(email, token);
        req.flash('success', `Reset link sent `);
        res.redirect(`/login`);

    }else{
        req.flash('error', 'No user found !')
        res.redirect('/forgotpass')
    }

 }

 module.exports.resetfp = async (req, res) => {
    const token = req.query.token;
    if(token){
        var check = await resetToken.findOne({token: token});
        if(check){
            res.render('users/resetfp', {email:check.email})
        } else{ 
            req.flash('error','Invalid Token or token expired.')
            res.render('users/forgotpass')
        }
    } else {
        res.redirect('/login')
    }
 }

 module.exports.presetfp = async (req, res) => {
    const { password , conpassword, email } = req.body;
    if(password !== conpassword){
        req.flash('error','Passwords do not match !');
        res.render('users/forgotpass');
    }else{
        var user = await User.findOne({ email : email });
        await user.setPassword(password);
        await user.save();
        req.flash('success',"Yay ! Successfully changed password ! Don't forget now :)");
        res.render('users/login');
    }
 }