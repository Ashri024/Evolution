const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    senderId: {
        type: String, 
        required: true, 
    },
    senderName: {
        type: String, 
        required: true, 
    },
    receiverName: {
        type: String, 
        required: true, 
    },
    receiverId: {
        type: String, 
        required: true, 
    },
   status:{
        type: String,
        default: "pending",
        enum: ["sent", "read","delivered","pending"]
   },
    timeStamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
