const jwt=require("jsonwebtoken")

const isAuthenticated=async(req,res)=>{
    try{
const token=req.cookie.token
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
   
res.id=decode.userId
next()
}catch(e){
console.log("Error in isAuthenticated");
console.log(e);
    }
}