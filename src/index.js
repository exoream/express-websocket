const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const routes = require("./routes/route");
const {
  handleMessage,
} = require("./controller/controller");

const app = express();
expressWs(app);

// Array to keep track of connected WebSocket clients
const clients = new Map();

app.use(express.json());
app.use("/", routes);
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Welcome to the Anime API",
  });
});

app.ws("/chat", (ws, req) => {
  const sessionId = parseInt(req.query.sessionId);
  ws.sessionId = sessionId;

  console.log(`New WebSocket connection with sessionId: ${sessionId}`);

  // Register the new client
  if (!clients.has(sessionId)) {
    clients.set(sessionId, new Set());
  }
  clients.get(sessionId).add(ws);

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log(
        `Received message: ${JSON.stringify(
          parsedMessage
        )} for sessionId: ${sessionId}`
      );
      handleMessage(ws, parsedMessage, clients);
    } catch (error) {
      console.error(
        `Failed to parse message: ${message}. Error: ${error.message}`
      );
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    console.log(`Connection closed for sessionId: ${sessionId}`);
    // Remove the client from the set
    if (clients.has(sessionId)) {
      clients.get(sessionId).delete(ws);
      if (clients.get(sessionId).size === 0) {
        clients.delete(sessionId);
      }
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for sessionId: ${sessionId}`, error);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
