const expressWs = require("express-ws");
const { updateStockAndClearCart } = require("./dbOperations")

const connectWs = (app) => {
  expressWs(app);

  app.ws("/ws", (ws, req) => {
    const userId = req.query.userId;

    console.log("WS CONNECTED: ", userId);

    ws.on("message", (message) => {
      console.log("WS MESSAGE: ", message);
    });

    ws.on("close", () => {
      console.log("WS USER DISCONNECTED: ", userId);
      updateStockAndClearCart(userId)
    });
  });
};

module.exports = connectWs;
