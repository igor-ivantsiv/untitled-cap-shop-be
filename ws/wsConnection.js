const expressWs = require("express-ws");
const { clearCartAndUpdateStock } = require("./dbOperations");

const logWsError = (err, context) => {
  console.error("ERROR IN WS: ", context.err.stack || err);
};

const connectWs = (app) => {
  expressWs(app);

  app.ws("/ws", (ws, req) => {
    const userId = req.query.userId;

    if (!userId) {
      ws.close();
      return;
    }

    console.log("WS CONNECTED: ", userId);

    ws.on("message", (message) => {
      console.log("WS MESSAGE: ", message);
    });

    ws.on("close", async () => {
      console.log("WS USER DISCONNECTED: ", userId);
      try {
        await clearCartAndUpdateStock(userId)
      }
      catch (error) {
        logWsError(error, "WebSocket Error")
      }
    });

    ws.on("error", (error) => {
      logWsError(error, "WebSocket error");
    });
  });
};

module.exports = connectWs;
