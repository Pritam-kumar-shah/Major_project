import { Server } from "socket.io";
import User from "../model/user.models.js";

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // USER ONLINE
    socket.on("join", async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          status: "online",
        });

        socket.userId = userId;

        io.emit("user_status", {
          userId,
          status: "online",
        });
      } catch (error) {
        console.log(error);
      }
    });

    // CHAT
    socket.on("send_message", (data) => {
      try {
        io.to(data.receiverSocketId).emit("receive_message", data);
      } catch (error) {
        console.log(error);
      }
    });

    // TYPING
    socket.on("typing", (data) => {
      io.to(data.receiverSocketId).emit("user_typing", {
        senderId: data.senderId,
      });
    });

    socket.on("stop_typing", (data) => {
      io.to(data.receiverSocketId).emit("user_stop_typing", {
        senderId: data.senderId,
      });
    });

    // AUDIO / VIDEO CALL

    socket.on("call_user", (data) => {
      io.to(data.receiverSocketId).emit("incoming_call", {
        callerId: data.callerId,
        callerName: data.callerName,
        callerSocketId: socket.id,
        callType: data.callType, // audio/video
      });
    });

    socket.on("accept_call", (data) => {
      io.to(data.callerSocketId).emit("call_accepted", {
        receiverSocketId: socket.id,
      });
    });

    socket.on("reject_call", (data) => {
      io.to(data.callerSocketId).emit("call_rejected");
    });

    socket.on("end_call", (data) => {
      io.to(data.receiverSocketId).emit("call_ended");
    });

    // WEBRTC SIGNALING

    socket.on("offer", (data) => {
      io.to(data.to).emit("offer", {
        offer: data.offer,
        from: socket.id,
      });
    });

    socket.on("answer", (data) => {
      io.to(data.to).emit("answer", {
        answer: data.answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", (data) => {
      io.to(data.to).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    });

    // MEETING ROOM

    socket.on("join_meeting", (meetingId) => {
      socket.join(meetingId);

      socket.to(meetingId).emit("participant_joined", {
        socketId: socket.id,
      });

      console.log(`${socket.id} joined meeting ${meetingId}`);
    });
    socket.on("meeting_message", (data) => {
      socket.to(data.meetingId).emit("meeting_message_received", {
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
        createdAt: new Date(),
      });
    });

    socket.on("leave_meeting", (meetingId) => {
      socket.leave(meetingId);

      socket.to(meetingId).emit("participant_left", {
        socketId: socket.id,
      });
    });

    socket.on("meeting_offer", (data) => {
      socket.to(data.meetingId).emit("meeting_offer", {
        offer: data.offer,
        from: socket.id,
      });
    });

    socket.on("meeting_answer", (data) => {
      socket.to(data.meetingId).emit("meeting_answer", {
        answer: data.answer,
        from: socket.id,
      });
    });

    socket.on("meeting_ice_candidate", (data) => {
      socket.to(data.meetingId).emit("meeting_ice_candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    });

    socket.on("disconnect", async () => {
      console.log("User Disconnected:", socket.id);

      try {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            status: "offline",
            lastSeen: new Date(),
            socketId: null,
          });

          io.emit("user_status", {
            userId: socket.userId,
            status: "offline",
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  });

  return io;
};

export default connectToSocket;
