const jwt=require("jsonwebtoken")

const isAuthenticated=async(req,res,next)=>{
    try{
const token=req.cookies.token
if(!token){
    return res.status(401).json({
        message:"User not Authenticated",
        success:false
    })
}
const decode=await jwt.verify(token,process.env.SECRET_KEY)
if(!decode){
    return res.status(401).json({
        message:"invalid",
        success:false
    })
}
   
req.id=decode.userId
next()
}catch(e){
console.log("Error in isAuthenticated");
console.log(e);
    }
}



module.exports=isAuthenticated