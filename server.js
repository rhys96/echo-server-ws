/*
 * This is the server side JavaScript, intended to be run with NodeJS.
 * It runs a WebSocket server on top of a HTTP server.
 */

var WebSocketServer = require('websocket').server;    //Use websocket API
var http = require('http');                           //Use nodes HTTP server API

//Create a HTTP server instance
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);                                              //Does not accept HTML requests
    response.end();
});


server.listen(8080, function() {                                          //Listens to the 8080 port
    console.log((new Date()) + ' Server is listening on port 8080');
});

//Wrap web socker server around http server
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//Can be manipulated to determine accepted users
function originIsAllowed(origin) {
  return true;
}

//Variables to log clients attached
var count = 0;
var clients = {};

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);   //Accept request and store all connection information
    var id = count++;                                                   //Add one to the id after setting id to previous value
    clients[id] = connection;                                           //Save client details

    console.log((new Date()) + ' Connection ' + "(" + connection.remoteAddress + ")" + ' accepted.');

    //On message flag, broadcast received message to all connected clients
    connection.on('message', function(message) {
      broadcast(message);
    });

    //One close flag, remove client from table
    connection.on('close', function(reasonCode, description) {
      delete clients[id];
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

//Broadcast message to all clients
function broadcast(message)
{
  for(var i in clients) {
    if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        clients[i].sendUTF(message.utf8Data);
    }
    else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        clients[i].sendBytes(message.binaryData);
    }
  }
}
