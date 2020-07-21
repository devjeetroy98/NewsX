const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');
const { token } = require('morgan');
const fs = require('fs')
const array = require('../data')
var router = express.Router();
router.use(express.json())


exports.regisUser = async function(req,res,next){
    const {name, email, password, passwordConfirm} = req.body
    User.findOne({email:email},(err,data)=>{
        if (err) throw err
        if(data){
            res.status(500);
            res.render('login',{message : "Account already registered!"})
        }
        else{
            if(password===passwordConfirm){
                const user = new User(req.body);
                user.save();
                res.redirect('/api/user/login');
            }
            else{
                res.redirect('/api/user/register');
            }
        }
    })
}

exports.loginUser = function(req,res,next){
    const {email,password} = req.body;
    try{
        User.findOne({email:email},(err, loginuser)=>{
            if(loginuser){
                bcrypt.compare(password,loginuser.password,(err,data)=>{
                    if (err) throw err
                    if(data===true){
                        const tokenuser = loginuser.newAuthToken(loginuser._id);
                        writable = JSON.stringify(loginuser)
                        fs.writeFile('./data.js',`[${writable}]`, err=>{
                            if (err) {
                                throw err
                            }
                            res.status(200);
                            res.redirect('/dashboard');
                            res.end()
                        })
                    }
                    else{
                        res.status(500);
                        res.render('login',{message :"Password doesn't match!"});
                        next()
                    }
                });
            }else{
                res.status(400);
                res.redirect('/api/user/register');
                next()
            }          
        })
    }catch(err){
        res.status(400).send()
    }
}

exports.deleteUser = async function(req,res,next){
    try{
        var data = await User.findById({_id : req.params.id})
                if(data.loginToken===null){
                    res.status(401).send("Login First to delete your account!")
                }
                else if(data.loginToken){
                    User.deleteOne({_id:req.params.id},(err, data)=>{
                        if (err) throw err
                        else{
                            res.status(200);
                            fs.writeFile('./data.js', '', function(){console.log('')})
                            res.redirect('/api/user/register')
                        }
                    })                  
                } 
                else{
                    res.status(401).send("Login First!")
                }                           
    }
    catch(err){
        res.status(500).send()
    }
}

exports.logoutFunc = async function(req,res,next){
    try{
        var doc = await User.findOneAndUpdate({_id: req.params.id},{loginToken: undefined},{new:true,useFindAndModif:false})
        res.status(200);
        // fs.writeFile('./data.js', '', function(){console.log('')})
        res.redirect('/api/user/login')

    }catch(err){
        res.status(500).send()
    }
    
}

exports.getRegister = async function(req,res,next){
    try{
        await res.render('register',{message: null})
    }
    catch{
        res.status(500).send()
    }
}

exports.getLogin = async function(req,res,next){
    try{
        await res.render('login',{message: null})
    }
    catch{
        res.status(500).send()
    }
}

exports.getCover = async function(req,res,next){
    await res.render('cover');
}