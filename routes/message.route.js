const express=require('express')
const upload=require('../middlewares/multer.js')
const isAuthenticated = require('../middlewares/isAuthenticacted')
const router=express.Router()
const {sendMessage,getMessage}=require("../controllers/message.controller.js")

router.route("/send/:id").post(isAuthenticated,sendMessage)
router.route("/all/:id").post(isAuthenticated,getMessage)


module.exports=router