import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import connectToSocket from "./src/controller/socketManager.js";
import authRoutes from "./src/routes/user.routes.js";
import meetingRoutes from "./src/routes/meeting.route.js";
import messageRoutes from "./src/routes/message.routes.js";
import callRoutes from "./src/routes/call.routes.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
// app.use(bodyParser.json());
const server = createServer(app);
const io = connectToSocket(server);
const PORT = process.env.PORT || 3002;
app.set("port", process.env.PORT || 3002);
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

const url =
  process.env.MONGO_URI ||
  "mongodb://mrpritamraj21_db_user:rDAUzinFszWeCXQd@ac-5pwkbys-shard-00-00.qwpyzzf.mongodb.net:27017,ac-5pwkbys-shard-00-01.qwpyzzf.mongodb.net:27017,ac-5pwkbys-shard-00-02.qwpyzzf.mongodb.net:27017/Connectify?ssl=true&replicaSet=atlas-134bsq-shard-0&authSource=admin&appName=Connectify";

app.use("/api/auth", authRoutes);

app.use("/api/meeting", meetingRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);

mongoose
  .connect(url)
  .then(() => {
    console.log("MongoDB Connected");

    server.listen(app.get("port"), () => {
      console.log(`App started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
