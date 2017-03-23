/*
 *  This program runs in the clients browser. It connects to the server using
 *  a WebSocket pointing at the ws://<ip address>:8080 WebSocket Server. This program
 *  allows the user to send a message to the server and the message is then
 *  broadcasted out to all nodes.
 */

function log(msg) {
  document.getElementById('log').innerText += msg + '\n';
  console.log(msg);
}

// Initialize everything when the window finishes loading
window.addEventListener("load", function(event) {
  var status = document.getElementById("status");   //Associate variables to items in the HTML page
  var url = document.getElementById("url");
  var n = document.getElementById("name");
  var open = document.getElementById("open");
  var close = document.getElementById("close");
  var send = document.getElementById("send");
  var text = document.getElementById("text");
  var message = document.getElementById("message");
  var socket;

  var name = prompt("ENTER IN YOUR NAME");  //Get name of user
  n.textContent = name;                     //Set name of user to document object

  status.textContent = "Not Connected";
  url.value = "ws://<INSERT IP ADDRESS>:8080";
  close.disabled = true;
  send.disabled = true;

  // Create a new connection when the Connect button is clicked
  open.addEventListener("click", function(event) {
    open.disabled = true;
    socket = new WebSocket(url.value, "echo-protocol");

    socket.addEventListener("open", function(event) {
      close.disabled = false;
      send.disabled = false;
      status.textContent = "Connected";
      log("Connected to " + url.value);
      socket.send(name + " joined the chat.");
    });

    // Display messages received from the server
    socket.addEventListener("message", function(event) {
      log(event.data);
    });

    // Display any errors that occur
    socket.addEventListener("error", function(event) {
      message.textContent = "Error: " + event;
    });

    socket.addEventListener("close", function(event) {
      open.disabled = false;
      status.textContent = "Not Connected";
      log("Disconnected from " + url.value);
      socket.send(name + " left the chat.");
    });
  });

  // Close the connection when the Disconnect button is clicked
  close.addEventListener("click", function(event) {
    close.disabled = true;
    send.disabled = true;
    message.textContent = "";
    socket.close();
  });

  // Send text to the server when the Send button is clicked
  send.addEventListener("click", function(event) {
    socket.send(name + ": " + text.value );
    text.value = "";
  });
});
