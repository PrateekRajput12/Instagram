const express=require('express')
const Sharp=require("sharp")
const cloudinary=require("../utils/cloudinary")
const Post = require('../model/post.model')
const User = require('../model/user.model')
const { post } = require('../routes/user.route')
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




const getCommentOfPost=async(req,res)=>{
    try {
        const postid=req.params.id
        const comments=await Comment.find({post:postid}.populate("author",'username,profilePicture'))

        if(!comments) return res.status(404).json({message:"No comment found for this post",success:false})

            return res.status(200).json({success:true,
                comments
            })
    } catch (error) {
        console.log("error in getting comment of all post");
        console.log(error);
    }
}

const deletePost=async(req,res)=>{
    try {
        const postId=req.params.id
        const authorId=req.id
        const post=await Post.findById(postId)

        if(!post) return res.status(404).json({message:"Post Not found ",success:false})
            // check if logged in user is owner of post

        if(post.author.toString()!== authorId){
            return res.status(403).json({message:"Unauthorized "})
        }

        // delete post

        await Post.findByIdAndDelete(postId)


        //  ermove the post id from the user post 
        let user=await User.findById(authorId)
        user.posts=user.posts.filter(id=>id.toString()!==postId)
        await user.save()

        // delete associated comments
        await Comment.deleteMany({post:postId})
        
        return res.status(200).json({
            message:"Post deleted",
            success:true
        })
    } catch (error) {
         console.log("erro in deleting post");
         console.log(error);
    }
}


const bookmarkPost=async(req,res)=>{
    try {
        
        const postId=req.params.id
        const authorId=req.id
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({message:"Page not found",success:false})

            const user= await User.findById(authorId)
            if(user.bookmarks.includes(postId)) {
                // already bookmark then remove from bookmark
await User.updateOne({$pull:{bookmarks:post._id}})
await user.save()
return res.status(200).json({type:'unsave',message:"Post removed from bookmark successfull",
    success:true
})
            }else{
                // bookmark karna padega 
                await User.updateOne({$addToSet:{bookmarks:post._id}})
await user.save()
return res.status(200).json({type:'unsave',message:"Post bookmarked successfull",
    success:true
})
            }
    } catch (error) {
        console.log("error in bookmark post");
        console.log(error);
    }
}

module.exports={
    bookmarkPost,
    deletePost,
    getCommentOfPost,
    addComment,
    disLikePost,
    likePost,
    getPostOfUser,
    getAllPost,
    addNewPost
}