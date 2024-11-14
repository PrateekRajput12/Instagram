const Conversation = require("../model/conversation.model")
const Message = require("../model/message.model")

const sendMessage=async (req,res)=>{
    try {
     const  senderId=req.id
     const receiverId=req.params.id
     const {message}=req.body

     let conversation=await Conversation.findOne({
        participants:{$all:[senderId,receiverId]}
     })

    //  establish conversation if not started yet

    if(!conversation){
       conversation=await Conversation.create({
        participants:[senderId,receiverId]
       }) 
    }
    const newMessage=await Message.create({
        senderId,
        receiverId,
        message
    })
    if(newMessage) conversation.messages.push(newMessage._id)
        await Promise.all([conversation.save(),newMessage.save()])
    // Implement Socket io for real time data transfer

    return res.status(201).json({
        success:true,
        newMessage
    })
    } catch (error) {
        console.log(error);
    }
}



const getMessage=async (req,res)=>{
    try {
       const senderId=req.id
       const receiverId=req.params.id
       const conversation=await Conversation.find({
participants:{$all:[senderId,receiverId]}
       }) 
       if(!conversation){
        return res.status(200).json({success:true,messages:[]})
       }

       return res.status(200).json({success:true,messages:conversation.messages})
    } catch (error) {
        console.log("error in getMessage");
        console.log(error);
    }
}

module.exports={
    getMessage,
    sendMessage

}