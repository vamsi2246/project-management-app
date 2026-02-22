// Initialize environment variables from .env
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");


require("./passport");



const userRoutes = require("./routes/userRoutes.js");
const boardRoutes = require("./routes/boards.js");


const listRoutes = require("./routes/lists.js");
const cardRoutes = require("./routes/cards.js");
const commentRoutes = require("./routes/comments.js")
const labelRoutes = require("./routes/labels.js")
const activityRoutes = require("./routes/activity.js")
const cardDetailsRoutes = require("./routes/cardsDetails");
const calendarRoutes = require("./routes/calendarRoutes");





const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express(); // Initialize express application
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://project-management-app-tau-six.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(
  cors({
    origin: [
      "https://project-management-app-tau-six.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);


// Increase JSON payload limit for attachments
app.use(express.json({ limit: "50mb" }));
// Support large URL-encoded payloads
app.use(express.urlencoded({ limit: "50mb", extended: true }));


app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none"
    }
    ,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);


app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/cards/details", cardDetailsRoutes);
app.use("/api/events", require("./routes/events"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/calendar", calendarRoutes);
app.use("/api/settings", require("./routes/settings"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/invitations", require("./routes/invitationRoutes"));


// Socket.io Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-project", (projectId) => {
    socket.join(projectId || "global");
  });

  socket.on("send-message", async (data) => {
    // data: { userId, projectId, recipientId, messageText, attachmentUrl, fileName, fileType }
    try {
      const { userId, projectId, recipientId, messageText, attachmentUrl, fileName, fileType } = data;

      // Save to DB
      const newMessage = await prisma.message.create({
        data: {
          content: messageText || "", // Allow empty content if there's an attachment
          userId: userId,
          projectId: projectId ? parseInt(projectId) : null,
          recipientId: recipientId ? parseInt(recipientId) : null,
          attachmentUrl,
          fileName,
          fileType
        },
        include: {
          user: {
            select: { id: true, name: true, profilePic: true }
          }
        }
      });

      // Broadcast to room
      if (projectId) {
        io.to(projectId).emit("receive-message", newMessage);
      } else if (recipientId) {
        // DM logic: emit to both sender and recipient
        io.to(`user-${recipientId}`).emit("receive-message", newMessage);
        io.to(`user-${userId}`).emit("receive-message", newMessage);
      } else {
        io.to("global").emit("receive-message", newMessage);
      }

    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


app.get("/", (req, res) => {
  res.send("✅ Server running and connected to MySQL");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));