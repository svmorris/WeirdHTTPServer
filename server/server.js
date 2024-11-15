const net = require('net');
const functions = require('./functions');
const {HOST, PORT} = require('./config');

process.stdout.write(`Starting server on ${HOST}::${PORT}... `)

// Server definition
const socket_server = net.createServer((socket) => {
    console.log(`Connection recieved: ${socket.remoteAddress}::${socket.remotePort}`)

    let response = null;
    socket.on('data', async (data) => {
        try {
            // Process request
            response = await functions.request_distributor(data);
            // Send response
            socket.write(response);
        } catch (err) {
            console.error(`Error processing request: ${err}`);
        }
    });

    // Handle client disconnecting
    socket.on('end', () => {
        console.log(`Client disconnected`);
    });
    // Handle errors
    socket.on('error', (err) => {
        console.error(`Error: ${err}`);
    });
});


// Start server
socket_server.listen(PORT, HOST, () => {
    console.log(`done`);
});
