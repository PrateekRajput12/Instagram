const User = require("../model/user.model")
const bcrypt=require('bcryptjs')
const jwt =require('jsonwebtoken')
const cloudinary=require('../utils/cloudinary')
const   getDataUri = require("../utils/datauri")
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

        const hashedPassword=await bcrypt.hash(password,10)
        await User.create({
            username,
            email,
            password:hashedPassword
        })
return res.status(201).json({
    message:"Account Created Successfully"
})
    } catch (error) {
    console.log("Error in reistering the user")
    console.log(error);
    }
}


const login=async (req,res)=>{
    try {
        
        const {email,password}=req.body
        if(!email || !password){
            return res.status(200).json({
                message:"Something is missing , please check!",
                success:false
            })
        }
let user=await User.findOne({email})
if(!user){
    return res.status(401).json({
        message:"Incorrect Email or password ",
        success:"False"
    })
}

const isPasswordMatch= await bcrypt.compare(password,user.password)
if(!isPasswordMatch){
    return res.status(401).json({
        message:"Incorrect Email or password ",
        success:"False"
    })
}
user={
    _id:user._id,
    username:user.username,
    email:user.email,
    profilePicture:user.profilePicture,
    bio:user.bio,
    followers:user.followers,
    following:user.following,
    posts:user.posts
}
const SECRET_KEY=process.env.SECRET_KEY
const token=await jwt.sign({userId:user._id},SECRET_KEY,{expiresIn:'1d'})
return res.cookie("token",token,{httpOnly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
    message:`Welcome back ${user.username}`,
    success:true,
    user
})
    } catch (error) {
        console.log("Error in Logining");
        console.log(error);
    }
}



const logout=async(_,res)=>{
try {
    return res.cookie("token","",{maxAge:0}).json({
        message:"Logged Out Successfully",
        success:true
    })
} catch (error) {
    
}
}


const getProfile=async(req,res)=>{
    try {
        const userId=req.params.id
        let user=await User.findById(userId).select('-password')
        return res.status(400).json({
            user,
            success:true
        })
    } catch (error) {
        console.log("Error in getProfile");
        console.log(error);
    }
}

const editProfile=async(req,res)=>{
    try{
        const userId = req.id;
        // console.log(userId);
        const {bio,gender}=req.body
        const profilePicture=req.file

        let cloudResponse ;
        if(profilePicture){
const fileUri=getDataUri(profilePicture)
cloudResponse=await cloudinary.uploader.upload(fileUri)
        }
        const user=await User.findById(userId).select('-password')

        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            })
        }
        if(bio) user.bio=bio
        if(gender) user.gender=gender
        if(profilePicture) user.profilePicture=cloudResponse.secure_url
        await user.save()
        return res.status(200).json({message:"Profile Updated Successfully",
            success:true,
            user
        })
    }
    catch(e){
console.log('Error in edit profile');
console.log(e);
    }
}


const getSuggestedUser=async(req,res)=>{
    try {
       const suggestedUsers=await User.find({_id:{$ne:req.id}}).select("-password")
       if(!suggestedUsers){
        return res.status(400).json({
            message:"Currently do not have any Users",
            success:false
        })
       }

       return res.status(200).json({
        success:true,
        user:suggestedUsers
    })

    } catch (error) {
        console.log("Problem in suggested user");
        console.log(error);
    }
}

const followOrUnfollow=async(req,res)=>{
    try {
        const followKarneWala=req.id  
        console.log(followKarneWala,"follow wala");// mine
        const jiskoFOllowKarunga=req.params.id  // whom i will follow
        if(followKarneWala===jiskoFOllowKarunga){
            return res.status(400).json({
                message:"You cannot follow or unfollow Yourself",
                success:true

            })
        }
        const user=await User.findById(followKarneWala)
        const targetUser=await User.findById(jiskoFOllowKarunga)
        if(!user || !targetUser){
            return res.status(400).json({
                message:"User not found",
                success:false

            })
        }

        // now check whether need to follow or unfollow

        const isFollowing=user.following.includes(jiskoFOllowKarunga)
        if(isFollowing){
            // unfollow logic
            await Promise.all([
                User.updateOne({_id:followKarneWala},{$pull:{following:jiskoFOllowKarunga}}),
                User.updateOne({_id:jiskoFOllowKarunga},{$pull:{followers:followKarneWala}})

            ])
            return res.status(200).json({message:"Unfollow successfully",success:true

            })
        }else{
            // follow logic
            await Promise.all([
                User.updateOne({_id:followKarneWala},{$push:{following:jiskoFOllowKarunga}}),
                User.updateOne({_id:jiskoFOllowKarunga},{$push:{followers:followKarneWala}})

            ])
            return res.status(200).json({message:"follow successfully",success:true})

        }

    } catch (error) {
        console.log("error in follow or Unfollow");
        console.log(error);
    }
}





module.exports={
    register
,login
    ,logout
,    getProfile
    ,editProfile
    ,getSuggestedUser
    ,followOrUnfollow
}
