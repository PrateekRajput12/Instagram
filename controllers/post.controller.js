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
const posts=await Post.find().sort({createdAt:-1}).populate({path:'author',select:'username,profilePicture'})
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



const getPostOfUser=async(req,res)=>{
    try{
    const authorId=req.id
    const posts=await Post.find({author:authorId}).sort({createdAt:-1}).populate({path:"author",select:'username,profilePicture'})
    .populate({path:'comments',
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
        console.log("error in getPost user");
        console.log(e);
    }
}


const likePost=async(req,res)=>{
    try{
        const likeKrneWaleUserKiId=req.id
        const postId=req.params.id
        const post=await Post.findById(postId)
if(!post){
    return res.status(404).json({
        message:"Post not found",
        success:false
    })
}
// like logic statement
await post.updateOne({$addToSet:{likes:likeKrneWaleUserKiId}})
await post.save()
// implement socket iio for real time notification

return res.status(200).json({
    message:"Post liked ",
    success:true
})
    }
    catch(e){
console.log("Error in like post");
console.log(e);
    }
}


const disLikePost=async(req,res)=>{
    try{
        const disLikeKrneWaleUserKiId=req.id
        const postId=req.params.id
        const post=await Post.findById(postId)
if(!post){
    return res.status(404).json({
        message:"Post not found",
        success:false
    })
}
// like logic statement
await post.updateOne({$pull:{likes:disLikeKrneWaleUserKiId}})
await post.save()
// implement socket iio for real time notification

return res.status(200).json({
    message:"Post Disliked ",
    success:true
})
    }
    catch(e){
console.log("Error in Dislike post");
console.log(e);
    }
}



const addComment=async(req,res)=>{
    try{
const postId=req.params.id
const commmentKrneWalaUserKiId=req.id

const {text}=req.body
const post =await Post.findById(postId)
if(!text) return res.status(400)
.json({
    message:"text is required",
    success:false
})

const comment=await Comment.create({
    text,
    author:commmentKrneWalaUserKiId,
    post:postId
}).populate({
    path:'author',
    select:'username , profilePicture'
})
post.comments.push(comment._id)
await post.save()
return res.status(201).json({
    message:"Comment Added",
    comment,
    success:true
})
    }catch(e){
console.log("error in add comment");
console.log(e);
    }
}