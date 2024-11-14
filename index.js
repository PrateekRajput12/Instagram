const express=require("express")
const cors=require("cors")
const cookieParserr=require("cookie-parser")
require('dotenv').config()
const app=express()
const userRoute=require("./routes/user.route")
const postRoute=require('./routes/post.route')
const messageRoute=require("./routes/message.route")
const connectDB=require('./utils/db')
app.get("/",(_,res)=>{
    return res.status(200).json({
        message:"I'm coming from backend",
        success:true
    })
})
app.use(express.json())
app.use(cookieParserr())
app.use((express.urlencoded({extended:true})))


const corsOptions={
    origin:'http://localhost:5173',
    credentials: true
}


app.use(cors(corsOptions))
app.use("/api/v1/user",userRoute)
app.use("/api/v1/post",postRoute)
app.use("/api/v1/message",messageRoute)



const PORT=process.env.PORT || 8000


app.listen(PORT,()=>{
connectDB()
    console.log(`Listening on port : ${PORT}`);
})



