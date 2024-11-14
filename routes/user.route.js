const express=require('express')
const upload=require('../middlewares/multer.js')
const { register, login, logout, getProfile, editProfile, getSuggestedUser, followOrUnfollow } = require('../controllers/user.controller')
const isAuthenticated = require('../middlewares/isAuthenticacted')
const router=express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/:id/profile').get(isAuthenticated,getProfile)
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'),editProfile)
router.route('/suggested').get(isAuthenticated,getSuggestedUser)
router.route('/followorunfollow/:id').post(isAuthenticated,followOrUnfollow)


module.exports=router