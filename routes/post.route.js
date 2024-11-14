const express=require('express')
const isAuthenticated = require('../middlewares/isAuthenticacted')
const upload = require('../middlewares/multer')
const { addNewPost, getAllPost, getPostOfUser, likePost, disLikePost, addComment, getCommentOfPost, deletePost, bookmarkPost } = require('../controllers/post.controller')

const router=express.Router()

router.route("/addpost").post(isAuthenticated,upload.single('image'),addNewPost)
router.route("/all").get(isAuthenticated,getAllPost)
router.route("/userpost/all").get(isAuthenticated,getPostOfUser)
router.route("/:id/like").get(isAuthenticated,likePost)
router.route("/:id/dislike").get(isAuthenticated,disLikePost)
router.route("/:id/comment").post(isAuthenticated,addComment)
router.route("/:id/comment/all").post(isAuthenticated,getCommentOfPost)
router.route("/delete/:id").post(isAuthenticated,deletePost)
router.route("/:id/bookmark").post(isAuthenticated,bookmarkPost)



module.exports= router
