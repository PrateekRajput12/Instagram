const mongoose=require("mongoose")

const connectDB =async ()=>{
   try {
    await  mongoose.connect(process.env.MONGO_URL)
    console.log("MongoDB connected succcesfuly");
   } catch (error) {
    console.log("Error in connecetion mongodb");
   }
    
}

module.exports =connectDB