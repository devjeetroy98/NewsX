const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// require('dotenv').config()

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true,
        // validate:[true,"Please provide us your name!"]
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid!");
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        // validate:[true, "Please enter a password!"]
    },
    passwordConfirm:{
        type: String,
        required: true,
        minlength: 7,
        validate:{
            validator: function(elem){
                return elem === this.password
            },
            message:"Password & Confirm Password doesn't match!"
        }
    },
    loginToken:{
        type:String
    }
})

userSchema.methods.newAuthToken = async function(loginid){
    const token = jwt.sign({_id: loginid.toString()}, "Roses-are-red-sky-is-blue-I-mind-my-business-why-dont-you",{expiresIn:'1d'})
    var doc = await User.findOneAndUpdate({_id : loginid},{ loginToken : token },{new:true,useFindAndModif:false})
    return doc
}


// userSchema.methods.correctPassword = async function(candidatePass, userPass){
//     return await bcrypt.compare(candidatePass,userPass);
// }


userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next()
})


const User = mongoose.model("User",userSchema);

module.exports= User