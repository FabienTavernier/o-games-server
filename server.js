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
let id = 0;

io.on('connection', (ws) => {
  console.log('>> socket.io - connected');

  ws.on('client_send_data', (data) => {
    data.id = Math.random().slice(2, 10);

    io.emit('server_send_data', data);
  });
});

/*
 * Server
 */
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});