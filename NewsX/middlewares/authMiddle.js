const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema')

require('dotenv').config()

const auth = async (req,res,next)=>{
    var userid = req.params.id
    try{
        const user = await User.findOne({_id: userid})
        const token = user.loginToken
        const decoded = jwt.verify(token,"Roses-are-red-sky-is-blue-I-mind-my-business-why-dont-you")
        if(userid === decoded._id){
            const user2 = await User.findOne({_id: decoded._id,"loginToken":token})
            if(user2){
                next()
            }
        }        
        else{
            throw new Error()
        }
    }
    catch(error){
        res.status(401).send({error:"Please authenticate!"})
    }
}

module.exports = auth