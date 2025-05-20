const { string, boolean } = require('joi');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    image:{
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    about:{
        type: String,
        required:false
    },
    verify:{
        type: Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

userSchema.plugin(passportLocalMongoose); 
// It automatically creates a username field and password field

module.exports = mongoose.model('User', userSchema)