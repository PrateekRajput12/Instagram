const User = require("../model/user.model")
const bcrypt=require('bcryptjs')
const register=async(req,res)=>{
    try {
        const {username,email,password}=req.body
        if(!username || !email || !password){
        return res.status(400).json({
            message:"Something is missing, please check !",
            success:false
        })
        }

        const user=await User.findOne({email})
        if(user){
            return res.status(400).json({
                message:'try  different email',
                success:false
            })
        }

        const hashedPassword=await bcrypt.hash(password,process.env.SAL)
        await User.create({
            username,
            email,
            password
        })
return res.status(201).json({
    message:"Account Created Successfully"
})
    } catch (error) {
    console.log("Error in reistering the user")
    console.log(error);
    }
}