const expressWs = require("express-ws");
const { clearCartAndUpdateStock } = require("./dbOperations");
const Message = require("../models/Message.model");
const User = require("../models/User.model");

const logWsError = (err, context) => {
  console.error("ERROR IN WS: ", context, err);
};

const findUsername = async (id) => {
  let username = "Not-found";
  try {
    const foundUsername = await User.findById(id).select("username");
    username = foundUsername.username
  } catch (error) {
    logWsError("error finding username");
  }
  return username;
};

const handleMessage = async (senderId, message, connectedUsers, username) => {
  const { recipientId, content } = message;

  try {
    const newMessage = await Message.create({
      senderId: senderId,
      recipientId: recipientId,
      content,
    });

    if (!newMessage) {
      logWsError(error, "WebSocket error -creating message in db");
    }

    const recipientWs = connectedUsers.get(recipientId);
    console.log("WS RECIPIENT: ", recipientId);
    if (recipientWs) {
      console.log("WS MESSAGE SENT");
      recipientWs.send(JSON.stringify({ senderId, username, content }));
    }
  } catch (error) {
    logWsError(error, "WebSocket error -handle message");
  }
};

const connectWs = (app) => {
  expressWs(app);

  const connectedUsers = new Map();

  app.ws("/ws", async (ws, req) => {
    const userId = req.query.userId;

    if (!userId) {
      ws.close();
      return;
    }

    const username = await findUsername(userId);

    console.log("WS CONNECTED: ", userId);
    console.log("USERNAME: ", username);
    connectedUsers.set(userId, ws);

    try {
      // retrieve unread messages
      const unreadMessages = await Message.find({
        recipientId: userId,
        read: false,
      }).populate("senderId", "username");

      // send unread messages
      unreadMessages.forEach((msg) => {
        ws.send(
          JSON.stringify({
            senderId: msg.senderId._id,
            username: msg.senderId.username,
            content: msg.content,
            timestamp: msg.createdAt,
          })
        );
      });

      // mark messages as read
      await Message.updateMany(
        { recipientId: userId, read: false },
        { read: true }
      );
    } catch (error) {
      logWsError(error, "WebSocket error -unread messages");
    }

    ws.on("message", (message) => {
      console.log("WS MESSAGE: ", message);
      const parsedMessage = JSON.parse(message);
      handleMessage(userId, parsedMessage, connectedUsers, username);
    });

    ws.on("close", async () => {
      console.log("WS USER DISCONNECTED: ", userId);
      connectedUsers.delete(userId);
      try {
        await clearCartAndUpdateStock(userId);
      } catch (error) {
        logWsError(error, "WebSocket Error on disconnection");
      }
    });

    ws.on("error", (error) => {
      logWsError(error, "WebSocket error");
    });
  });
};

module.exports = connectWs;
