const express=require('express')
const Sharp=require("sharp")
const cloudinary=require("../utils/cloudinary")
const Post = require('../model/post.model')
const User = require('../model/user.model')
const addNewPost=async(req,res)=>{
    try {
        const {caption}=req.body
        const image=req.file
        const authorId=req.id

        if(!image){
            return res.status(401).json({
                message:"Image Required",
                success:"False"
            })
        }


        // image Upload
        const optimixedImageBuffer=await sharp(image.buffer).resize({width:800,height:800,fit:'inside'})
        .toFormat('jpeg',{quality:80})
        .toBuffer();

        // buffer to data uri

        const fileUri=`data:image/jpeg;base64,${optimixedImageBuffer.toString('base64')}`
const cloudResponse=await cloudinary.uploader.upload(fileUri)
const post =await Post.create({
    caption,
    image:cloudResponse.secure_url,
    author:authorId
})
const user= await User.findById(authorId)
if(user){
    user.posts.push(post._id)
    await user.save()
}
await post.populate({path:'author',select:'-password'})

return res.status(201).json({
    message:"New post addes",
    post,
    success:true

})
    } catch (error) {
        console.log('error in add new post');
        console.log(error);
    }
}



const getAllPost =async(req,res)=>{
    try{
const post=await Post.find().sort({createdAt:-1}).populate({path:'author',select:'username,profilePicture'})
.populate({
    path:'comments',
    sort:{createdAt:-1},
    populate:{
        path:'author',
        select:'username,profilePicture'
    }
})
return res.status(200).json({
    posts,
    success:true
})
    }catch(e){
        console.log("error in get All Posts");
        console.log(e);
    }
}
