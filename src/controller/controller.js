const sessions = new Map();
let nextSessionId = 1;

const createSession = (req, res) => {
  const { user1, user2 } = req.body;
  if (!user1 || !user2) {
    return res.status(400).json({ error: "User1 and User2 are required" });
  }

  const sessionId = nextSessionId++;
  sessions.set(sessionId, { user1, user2, messages: [] });

  console.log(`Created new session with sessionId: ${sessionId}`);
  res.json({ sessionId });
};

const handleMessage = (ws, message, clients) => {
  const { user, text } = message;
  const sessionId = ws.sessionId;

  console.log(`Handling message for sessionId: ${sessionId}`);

  if (!sessions.has(sessionId)) {
    console.log(`Invalid sessionId: ${sessionId}`); // Debug log
    return ws.send(JSON.stringify({ error: "Invalid session ID" }));
  }

  const session = sessions.get(sessionId);
  if (session.user1 !== user && session.user2 !== user) {
    return ws.send(JSON.stringify({ error: "User not part of this session" }));
  }

  const msg = { user, text, timestamp: new Date() };
  session.messages.push(msg);

  // Broadcast message to all clients in the session
  if (clients.has(sessionId)) {
    clients.get(sessionId).forEach((client) => {
      if (client !== ws) {
        client.send(JSON.stringify(msg));
      }
    });
  }
};

module.exports = { createSession, handleMessage };
