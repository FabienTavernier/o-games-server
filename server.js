/*
 * Require
 */
const express = require('express');
const Server = require('http').Server;
const socket = require('socket.io');

/*
 * Vars
 */
const app = express();
const server = Server(app);
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
  }
});
const port = 3001;

/*
 * Express
 */
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  // response.header('Access-Control-Allow-Credentials', true);
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Server homepage : GET /
app.get('/', (request, response) => {
  response.send(`
    <div style="margin: 5em auto; width: 400px; line-height: 1.5">
      <h1 style="text-align: center">Hello!</h1>
      <p>Si tu vois ce message, c'est que ton serveur est bien lancé !</p>
    </div>
  `);
});

/*
 * Socket.io
 */
io.on('connection', (ws) => {
  // A player creates a game
  ws.on('create', (gameID) => {
    ws.join(gameID);
  });

  // An other player joins the game
  ws.on('join', (data) => {
    const { gameID, variant } = JSON.parse(data);

    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(gameID);

    if (room.size < 2) {
      ws.join(gameID);
      io.emit('player_join', JSON.stringify({
        gameID,
        variant,
        clientId: ws.id,
      }));
    }
    else {
      io.emit('player_reject', ws.id);
    }
  });

  // A player clicks on a cell
  ws.on('move', (data) => {
    const { gameID } = JSON.parse(data);
    io.to(gameID).emit('player_move', data);
  });

  // A player restarts a game
  ws.on('restart', (data) => {
    const { gameID } = JSON.parse(data);
    io.to(gameID).emit('restart', data);
  });
});

/*
 * Server
 */
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});