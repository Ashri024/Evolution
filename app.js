const express = require('express');
const http = require('http'); // Import http module
const socketIo = require('socket.io'); // Import socket.io
const app = express();
const connectDB = require('./db/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const ScheduleRoutes = require('./routes/Schedule');
const UserRoutes = require('./routes/User');
const port = process.env.PORT || 3000;
const Message = require('./models/Message');
const mongoose = require('mongoose');
const UploadRoute = require('./routes/Upload');

// Load db and env
require('dotenv').config();
connectDB();

// middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// This is my comment
// Api routes
app.use('/v0/api/images',UploadRoute)
app.use('/v0/api/schedule', ScheduleRoutes);
app.use('/v0/api/user', UserRoutes);
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 80000, // 60 seconds
    pingInterval: 30000 // 25 seconds
});
const userSocketMap = new Map();
const connectedUserIDs = new Set();
function getUserIdFromSocket(socket) {
    return socket?.handshake.query.userId;
}
function getSocketIdByUserId(userId) {
    return userSocketMap.get(userId);
}
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    async function getReceivedMessages(userId) {
        const receivedMessages = await Message.find({ receiverId: userId, status: 'sent' });
        return receivedMessages;
    }
    async function getUnreadMessages(userId) {
        const receivedMessages = await Message.find({ receiverId: userId, status: 'delivered' });
        return receivedMessages;
    }

    const markAllDelivered = async (userId) => {
        try {
            const receivedMessages = await getReceivedMessages(userId);
            receivedMessages.forEach(async (msg) => {
                msg.status = 'delivered';
                await msg.save();
                const senderSocketId = getSocketIdByUserId(msg.senderId);
                if (senderSocketId) {
                    socket.to(senderSocketId).emit('message status', msg);
                }
            });
        } catch (error) {
            console.error('Error marking messages as delivered:', error);
        }
    };

    const userId = getUserIdFromSocket(socket);
    if(userId){
    userSocketMap.set(userId, socket?.id);
    socket.on("markAllDelivered", async (userId) => {
        await markAllDelivered(userId);
    });
}
    const extractLastMessage=async(userId1, userId2)=> {
        const messages = await fetchMessages(userId1, userId2);
        if (messages.length > 0) {
            return messages[messages.length - 1];
        }
        return null;
    }
    let lastMessages=[];
    socket.on("allUsers", async (users) => {
        for (let i = 0; i < users.length; i++) {
            const lastMessage= await extractLastMessage(userId, users[i]);
            if(lastMessage){
                lastMessages.push(lastMessage);
            }
        }
        socket.emit("lastMessages", lastMessages);
    })
async function userInitialization(userId){
    if(userId){
    connectedUserIDs.add(userId);
    let receivedMessages = await getUnreadMessages(userId);
    io.emit('user connected', Array.from(connectedUserIDs),receivedMessages);
}
}
    userInitialization(userId);
 // if the user is online
    const fetchMessages = async (userId1, userId2) => {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            }).sort({ createdAt: 1 }); // Sort by createdAt in ascending order
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    };
   
    socket?.on('loadMessages', async ({ userId1, userId2 }) => {
        const messages = await fetchMessages(userId1, userId2);
        socket?.emit('messages', messages);
    });

    socket?.on("chat message", async(msg) => {
        // Saving the msg to db
        const message = new Message({
            message: msg.message,
            senderId: msg.senderId,
            senderName: msg.senderName,
            receiverName: msg.receiverName,
            receiverId: msg.receiverId,
            status: msg.status,
            timeStamp: msg.timeStamp || Date.now()
        });
        const finalMsg= await message.save();
    
        const receiverSocketId = getSocketIdByUserId(finalMsg.receiverId);
        
        if (receiverSocketId) {
            socket.to(receiverSocketId).emit("chat message", finalMsg);
        }
        
        socket.emit("msg_ID received", finalMsg);
    })
    // Update message status to 'delivered'
    socket?.on('message sent', async (messageId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(messageId)) {
                throw new Error('Invalid messageId');
            }
            const message = await Message.findById(messageId);
            if (message) {
                let msg;
                if(getSocketIdByUserId(message.receiverId)){
                    message.status = 'delivered';
                    msg= await message.save();
                    const receiverSocketId = getSocketIdByUserId(msg.receiverId);
                    if (receiverSocketId) {
                        socket.to(receiverSocketId).emit('new msg', msg);
                    }
                }else{
                    message.status = 'sent';
                    msg= await message.save();
            }
                const senderSocketId = getSocketIdByUserId(msg.senderId);
                if (senderSocketId) {
                    socket.emit('message status', msg);
                }
            }
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    })

    // Update message status to 'read'
    socket?.on('message read', async (messageId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(messageId)) {
                throw new Error('Invalid messageId');
            }
            const message = await Message.findById(messageId);
            if (message && message.status !== 'read') {
                message.status = 'read';
                const msg= await message.save();
                const senderSocketId = getSocketIdByUserId(message.senderId);
                if (senderSocketId) {
                    socket.to(senderSocketId).emit('message status', msg);
                }
            }
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    });

  socket?.on('disconnect', (reason,details) => {
    console.log('Client disconnected:', socket.id, 'for reason:', reason);
    console.log('details:', details);
    userSocketMap.delete(userId);
    connectedUserIDs.delete(userId);
    io.emit('user disconnected', Array.from(connectedUserIDs));
  });

  // Handle reconnection attempts
  socket.on('reconnect_attempt', () => {
    console.log('Client attempting to reconnect:', socket.id);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Client reconnected:', socket.id, 'on attempt:', attemptNumber);
  });
});
// Start the server
server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});