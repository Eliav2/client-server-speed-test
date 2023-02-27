import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

export interface ServerToClientEvents {
  pong: (time: number) => void;
  "speed-test": (data: { time: number; dummyData: any }) => void;
}

export interface ClientToServerEvents {
  "start-speed-test": (data: { time: number; fileSize: number }) => void;
  ping: (time: number) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: { origin: "*" },
});

app.get("/", (req, res) => {
  res.send("<h1>Express is running</h1>");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("start-speed-test", (data) => {
    console.log("received start-speed-test", data);
    socket.emit("speed-test", {
      time: data.time,
      dummyData: Buffer.alloc(data.fileSize),
    });
  });
  socket.on("ping", (time) => {
    console.log("received ping");
    socket.emit("pong", time);
  });
});

server.listen(8080, () => {
  console.log("listening on *:8080");
});

// import * as net from "net";
//
// const server = net.createServer((socket) => {
//   console.log("Client connected");
//
//   socket.on("data", (data) => {
//     console.log(`Received data: ${data}`);
//     // Handle incoming data
//   });
//
//   socket.on("end", () => {
//     console.log("Client disconnected");
//   });
// });
//
// server.listen(8080, () => {
//   console.log("TCP server started on port 8080");
// });
